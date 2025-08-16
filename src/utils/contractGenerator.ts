import { IGameState, IContract, ItemId, IFactory, ContractType, ItemDefinition } from '../types/game.types';
import { ITEM_DATABASE } from '../core/game-data/items';
import { nanoid } from 'nanoid';

/**
 * Helper function to identify items that the player's factories can produce.
 * @param factories An array of the player's factories.
 * @returns A Map where keys are ItemIds and values are ItemDefinition for producible items.
 */
function getProducibleItems(factories: IFactory[]): Map<ItemId, ItemDefinition> {
    const producible = new Map<ItemId, ItemDefinition>();
    factories.forEach(factory => {
        Object.entries(ITEM_DATABASE).forEach(([itemId, itemDef]) => {
            if (itemDef.recipe && (itemDef.requiredFactoryLevel || 1) <= factory.level) {
                producible.set(itemId, itemDef);
            }
        });
    });
    return producible;
}

/**
 * Helper function to identify items currently in the player's inventory.
 * @param inventory The player's current inventory.
 * @returns A Map where keys are ItemIds and values are ItemDefinition for items in inventory.
 */
function getInventoryItems(inventory: Record<ItemId, number>): Map<ItemId, ItemDefinition> {
    const items = new Map<ItemId, ItemDefinition>();
    Object.entries(inventory).forEach(([itemId, quantity]) => {
        if (quantity > 0 && ITEM_DATABASE[itemId]) {
            items.set(itemId, ITEM_DATABASE[itemId]);
        }
    });
    return items;
}

/**
 * Helper function to identify ingredients needed for producible items that the player is low on.
 * "Low on" is defined as having less than the amount required for one production cycle.
 * @param inventory The player's current inventory.
 * @param producibleItems A Map of items the player can produce.
 * @returns A Map where keys are ItemIds and values are ItemDefinition for needed ingredients.
 */
function getNeededIngredients(inventory: Record<ItemId, number>, producibleItems: Map<ItemId, ItemDefinition>): Map<ItemId, ItemDefinition> {
    const needed = new Map<ItemId, ItemDefinition>();
    producibleItems.forEach(itemDef => {
        if (itemDef.recipe) {
            itemDef.recipe.forEach(ingredient => {
                if ((inventory[ingredient.id] || 0) < ingredient.amount) {
                    if (ITEM_DATABASE[ingredient.id]) {
                        needed.set(ingredient.id, ITEM_DATABASE[ingredient.id]);
                    }
                }
            });
        }
    });
    return needed;
}

/**
 * Generates a list of new contracts for the logistics center, prioritizing relevant items.
 * @param gameState The current game state.
 * @param numContractsToGenerate The number of new contracts to generate.
 * @param currentDate The current game date, used for calculating contract expiration.
 * @returns An array of newly generated IContract objects.
 */
export function generateNewContracts(gameState: IGameState, numContractsToGenerate: number, currentDate: Date): IContract[] {
    const newContracts: IContract[] = [];
    const factories = gameState.buildings.filter(b => b.type === 'FABRICA') as IFactory[];
    const producibleItems = getProducibleItems(factories);
    const inventoryItems = getInventoryItems(gameState.inventory);
    const neededIngredients = getNeededIngredients(gameState.inventory, producibleItems);

    // Define pools for different contract types based on player's context
    const sellFromInventoryAndProducible = Array.from(inventoryItems.keys()).filter(id => producibleItems.has(id));
    const sellFromInventoryOnly = Array.from(inventoryItems.keys()).filter(id => !producibleItems.has(id));
    const sellProducibleOnly = Array.from(producibleItems.keys()).filter(id => !inventoryItems.has(id)); // Items player can make but doesn't have in stock
    const buyNeededIngredients = Array.from(neededIngredients.keys());
    const buyBaseResources = Object.entries(ITEM_DATABASE).filter(([, item]) => item.category === 'BASE').map(([id,]) => id);
    const allItems = Object.keys(ITEM_DATABASE);

    // Weighted choices for contract generation to prioritize relevance
    const contractTypeWeights = [
        { type: 'SELL_INVENTORY_PRODUCIBLE', weight: 40, pool: sellFromInventoryAndProducible },
        { type: 'BUY_FOR_PRODUCTION', weight: 20, pool: buyNeededIngredients },
        { type: 'SELL_INVENTORY_ONLY', weight: 15, pool: sellFromInventoryOnly },
        { type: 'BUY_BASE_RESOURCE', weight: 15, pool: buyBaseResources },
        { type: 'RANDOM_SELL', weight: 5, pool: sellProducibleOnly.length > 0 ? sellProducibleOnly : allItems.filter(id => ITEM_DATABASE[id].baseSellPrice > 0) },
        { type: 'RANDOM_BUY', weight: 5, pool: allItems.filter(id => ITEM_DATABASE[id].baseCost > 0) },
    ];

    const totalWeight = contractTypeWeights.reduce((sum, choice) => sum + choice.weight, 0);

    for (let i = 0; i < numContractsToGenerate; i++) {
        let selectedType: string | null = null;
        let randomWeight = Math.random() * totalWeight;

        // Select contract type based on weights and available pools
        for (const choice of contractTypeWeights) {
            if (randomWeight < choice.weight && choice.pool.length > 0) {
                selectedType = choice.type;
                break;
            }
            randomWeight -= choice.weight;
        }

        // Fallback to any available type if specific weighted types are not possible
        if (!selectedType) {
            const availableRandomTypes = contractTypeWeights.filter(c => c.pool.length > 0);
            if (availableRandomTypes.length === 0) continue; // No items to generate contracts for
            selectedType = availableRandomTypes[Math.floor(Math.random() * availableRandomTypes.length)].type;
        }

        let itemId: ItemId;
        let contractType: ContractType;
        let itemData: ItemDefinition;

        // Determine itemId and contractType based on the selected type
        const selectedPool = contractTypeWeights.find(c => c.type === selectedType)?.pool;
        if (!selectedPool || selectedPool.length === 0) continue; // Should not happen with fallbacks, but for safety

        itemId = selectedPool[Math.floor(Math.random() * selectedPool.length)];
        itemData = ITEM_DATABASE[itemId];
        if (!itemData) continue; // Item not found in database, skip

        if (selectedType.startsWith('SELL')) {
            contractType = 'SELL';
        } else {
            contractType = 'BUY';
        }

        // Calculate quantity and reward
        const maxContractValue = gameState.companyValue * 0.1; // Max value of a single contract
        // Base items might have smaller contracts to encourage frequent trading
        const targetValue = Math.random() * maxContractValue * (itemData.category === 'BASE' ? 0.5 : 1);
        const itemPrice = contractType === 'SELL' ? itemData.baseSellPrice : itemData.baseCost;
        let quantity = Math.max(1, Math.floor(targetValue / itemPrice));

        // Adjust quantity for SELL contracts based on inventory to avoid impossible contracts
        if (contractType === 'SELL' && gameState.inventory[itemId] > 0) {
            quantity = Math.min(quantity, gameState.inventory[itemId]);
            if (quantity === 0) continue; // If player has 0 after min, skip this contract
        } else if (contractType === 'SELL' && gameState.inventory[itemId] === 0 && !selectedType.includes('RANDOM')) {
            // If it's a targeted SELL contract (not random) but player has none, skip it
            continue;
        }

        // Ensure quantity is at least 1
        if (quantity < 1) quantity = 1;

        const travelTime = Math.floor(Math.random() * 3) + 1; // 1 to 3 days travel time
        const profitMargin = 1 + (Math.random() * 0.15 + 0.05); // 5-20% profit for sell contracts
        const costPremium = 1 + (Math.random() * 0.10 + 0.05); // 5-15% premium for buy contracts

        const reward = contractType === 'SELL' ? Math.floor(quantity * itemData.baseSellPrice * profitMargin) : -Math.floor(quantity * itemData.baseCost * costPremium);

        // Calculate expirationDate (3 to 7 days from current date)
        const expirationDays = Math.floor(Math.random() * 5) + 3;
        const expirationDate = new Date(currentDate.getTime() + expirationDays * 86400000);

        newContracts.push({ id: nanoid(), type: contractType, status: 'PENDING', itemId, quantity, reward, travelTime, expirationDate });
    }

    return newContracts;
}