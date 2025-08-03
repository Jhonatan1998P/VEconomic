// --- START OF FILE VEconomic-main/src/features/buildings/FactoryView.tsx ---

import React, { useState, useMemo } from 'react';
import { useGame } from '../../hooks/useGame';
import { ITEM_DATABASE } from '../../core/game-data/items';
import { IFactory, ItemDefinition, ItemId, ProductionQueueItem, RecipeItem, ItemCategory } from '../../types/game.types';
import Icon from '../../icons/Icon';
import { NavLink } from 'react-router-dom';

type FactoryViewProps = {
  factory: IFactory;
};

const CATEGORY_NAMES: Record<ItemCategory, string> = {
  COMPONENT: 'Componentes',
  ELECTRODOMESTICO: 'Electrodomésticos',
  ELECTRONICO: 'Electrónicos',
  BASE: 'Recursos Base',
};

export default function FactoryView({ factory }: FactoryViewProps) {
  const { gameState, startProduction } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [showOnlyProducible, setShowOnlyProducible] = useState(true);

  const producibleItems = useMemo(() =>
    Object.entries(ITEM_DATABASE)
      .map(([id, data]) => ({ ...data, id: id as ItemId }))
      .filter(item => item.recipe)
      .sort((a, b) => (a.requiredFactoryLevel || 0) - (b.requiredFactoryLevel || 0) || a.name.localeCompare(b.name)),
    []
  );

  const unlockedBlueprints = useMemo(() => 
    producibleItems.filter(item => factory.level >= (item.requiredFactoryLevel || 1)),
    [producibleItems, factory.level]
  );

  const lockedBlueprints = useMemo(() =>
    producibleItems.filter(item => factory.level < (item.requiredFactoryLevel || 1)),
    [producibleItems, factory.level]
  );

  const availableCategories = useMemo(() => {
    const categories = new Set(unlockedBlueprints.map(item => item.category));
    return Array.from(categories).sort((a, b) => CATEGORY_NAMES[a].localeCompare(CATEGORY_NAMES[b]));
  }, [unlockedBlueprints]);

  const filteredBlueprints = useMemo(() => {
    let items = unlockedBlueprints;

    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (showOnlyProducible) {
      items = items.filter(blueprint => 
        blueprint.recipe?.every(ing => (gameState.inventory[ing.id] || 0) >= ing.amount) ?? false
      );
    }

    return items;
  }, [unlockedBlueprints, selectedCategory, showOnlyProducible, gameState.inventory]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <NavLink to="/buildings" className="text-cyan-400 hover:text-cyan-300 transition-colors mb-4 inline-block">← Volver a Edificios</NavLink>
        <div className="flex items-center gap-4">
          <Icon name="factory" className="w-12 h-12 text-cyan-300" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
              Gestión de Fábrica: <span className="text-cyan-300">{factory.id}</span>
            </h1>
            <p className="text-gray-400">Nivel {factory.level} • Eficiencia: {factory.efficiency}% • Espacios de Producción: {factory.productionQueue.length}/{factory.productionSlots}</p>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Cola de Producción</h2>
        <div className="bg-gray-800/50 p-4 rounded-lg shadow-inner min-h-[120px]">
          {factory.productionQueue.length > 0 ? (
            <div className="space-y-4">
              {factory.productionQueue.map((item, index) => (
                <ProductionQueueCard key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No hay producción activa. ¡Selecciona un plano para comenzar!</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold text-gray-200">Planos Desbloqueados</h2>
          <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
            <input 
              type="checkbox"
              checked={showOnlyProducible}
              onChange={() => setShowOnlyProducible(!showOnlyProducible)}
              className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-gray-800 focus:ring-cyan-500"
            />
            <span>Mostrar solo fabricables</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-6">
          <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${!selectedCategory ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
            Todos
          </button>
          {availableCategories.map(category => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${selectedCategory === category ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
              {CATEGORY_NAMES[category]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlueprints.length > 0 ? filteredBlueprints.map(blueprint => (
            <BlueprintCard 
              key={blueprint.id}
              blueprint={blueprint}
              factory={factory}
              playerInventory={gameState.inventory}
              onProduce={(itemId, quantity) => startProduction(factory.id, itemId, quantity)}
            />
          )) : (
            <p className="text-gray-500 lg:col-span-3 text-center py-8">
              {showOnlyProducible ? "No tienes recursos para fabricar ningún plano en esta categoría." : "No hay planos en esta categoría."}
            </p>
          )}
        </div>
      </section>

      {lockedBlueprints.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-400">Planos Bloqueados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {lockedBlueprints.map(blueprint => (
              <div key={blueprint.id} className="bg-gray-800/60 p-3 rounded-lg text-center shadow-md border border-gray-700">
                <p className="font-bold text-gray-300">{blueprint.name}</p>
                <p className="text-xs text-gray-500">Req. Nivel {blueprint.requiredFactoryLevel}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function ProductionQueueCard({ item }: { item: ProductionQueueItem }) {
  const itemInfo = ITEM_DATABASE[item.itemId];
  const totalTime = (itemInfo.productionTime || 1) * item.quantity;
  const progress = Math.max(0, ((totalTime - item.timeRemaining) / totalTime) * 100);

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold text-lg text-white">{item.quantity}x {itemInfo.name}</p>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Icon name="hourglass" className="w-5 h-5"/>
          <span>{item.timeRemaining.toFixed(1)} días restantes</span>
        </div>
      </div>
      <div className="w-full bg-gray-900 rounded-full h-4 border-2 border-gray-600">
        <div className="bg-cyan-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function BlueprintCard({ blueprint, factory, playerInventory, onProduce }: { blueprint: ItemDefinition & {id: ItemId}, factory: IFactory, playerInventory: Record<ItemId, number>, onProduce: (itemId: ItemId, quantity: number) => void }) {
  const [quantity, setQuantity] = useState(1);

  const totalCost = useMemo(() => {
    return blueprint.recipe?.map(ing => ({...ing, total: ing.amount * quantity})) || [];
  }, [quantity, blueprint.recipe]);

  const canAfford = useMemo(() => 
    totalCost.every(ing => (playerInventory[ing.id] || 0) >= ing.total),
    [totalCost, playerInventory]
  );

  const isQueueFull = factory.productionQueue.length >= factory.productionSlots;

  const handleProduce = () => {
    if (canAfford && !isQueueFull && quantity > 0) {
      onProduce(blueprint.id, quantity);
      setQuantity(1);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-cyan-300">{blueprint.name}</h3>
        <p className="text-sm text-gray-400">Tiempo base por unidad: {blueprint.productionTime} día(s)</p>
      </div>
      <div className="p-4 space-y-3 flex-grow">
        <p className="text-sm font-semibold text-gray-300">Recursos necesarios:</p>
        <div className="space-y-2">
          {totalCost.map(ing => (
            <ResourceChip 
              key={ing.id}
              ingredient={ing}
              playerAmount={playerInventory[ing.id] || 0}
            />
          ))}
        </div>
      </div>
      <div className="p-4 bg-gray-900/50 rounded-b-lg mt-auto">
        <div className="flex gap-2 items-center">
          <input 
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button 
            onClick={handleProduce}
            disabled={!canAfford || isQueueFull || quantity <= 0}
            className={`px-6 py-2 rounded-md font-semibold text-white transition-colors w-full
              ${isQueueFull ? 'bg-yellow-600/50 cursor-not-allowed' : ''}
              ${!canAfford && !isQueueFull ? 'bg-red-600/50 cursor-not-allowed' : ''}
              ${canAfford && !isQueueFull ? 'bg-green-600 hover:bg-green-500' : ''}
            `}
          >
            {isQueueFull ? 'Cola Llena' : (!canAfford ? 'Sin Recursos' : 'Producir')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourceChip({ ingredient, playerAmount }: { ingredient: RecipeItem & {total: number}, playerAmount: number }) {
  const hasEnough = playerAmount >= ingredient.total;
  const itemInfo = ITEM_DATABASE[ingredient.id];

  return (
    <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
      <span className="text-gray-300">{itemInfo.name}</span>
      <span className={`font-mono font-bold ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
        {ingredient.total.toLocaleString()} / {playerAmount.toLocaleString()}
      </span>
    </div>
  );
}