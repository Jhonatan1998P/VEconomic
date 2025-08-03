// --- START OF FILE VEconomic-main/src/context/GameContext.tsx ---

import React, { createContext, useReducer, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { useLoading } from '../hooks/useLoading';
import { IGameState, Building, BuildingType, IFactory, ItemId, ProductionQueueItem, IContract, ITruck, ContractType, ILogisticsCenter } from '../types/game.types';
import { INITIAL_GAME_STATE } from '../core/initialState';
import { ITEM_DATABASE } from '../core/game-data/items';
import { UPGRADE_DATA } from '../core/game-data/upgrades';
import { gameReducer } from './gameReducer';
import { GameActionType } from './gameActionTypes';
import { nanoid } from 'nanoid';

export const BUILDING_DATA = {
  FABRICA: { name: 'Fábrica', cost: 5000, icon: 'factory' },
  ALMACEN: { name: 'Almacén', cost: 2500, icon: 'warehouse' },
  LABORATORIO_ID: { name: 'Laboratorio I+D', cost: 7000, icon: 'lab' },
  OFICINA_MARKETING: { name: 'Oficina de Marketing', cost: 4000, icon: 'marketing' },
  DEPARTAMENTO_RRHH: { name: 'Departamento de RRHH', cost: 3500, icon: 'hr' },
  CENTRO_LOGISTICA: { name: 'Centro de Logística', cost: 6000, icon: 'logistics' },
};

export const TRUCK_COST = 10000;

interface IGameContextType {
  gameState: IGameState;
  advanceDay: () => Promise<void>;
  purchaseBuilding: (type: BuildingType) => Promise<void>;
  startProduction: (factoryId: string, itemId: ItemId, quantity: number) => Promise<void>;
  upgradeBuilding: (buildingId: string) => Promise<void>;
  sellItem: (itemId: ItemId, quantity: number) => Promise<void>;
  acceptContract: (contractId: string) => Promise<void>;
  purchaseTruck: () => Promise<void>;
}

export const GameContext = createContext<IGameContextType>({} as IGameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
  const { addToast } = useToast();
  const { withLoading } = useLoading();

  const advanceDay = async () => {
    await withLoading(() => new Promise<void>(resolve => {
      const allNewEvents: string[] = [];
      const toastsToShow: { message: string, type: 'success' | 'error' }[] = [];
      let tempInventory = { ...gameState.inventory };

      const dailyCosts = 150 + gameState.buildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
      if (gameState.money < dailyCosts) {
        addToast("¡Fondos insuficientes para cubrir los costos diarios!", 'error');
        resolve();
        return;
      }

      const updatedBuildings = gameState.buildings.map(b => {
        if (b.type === 'FABRICA') {
          const factory = b as IFactory;
          const remainingQueue: ProductionQueueItem[] = [];
          factory.productionQueue.forEach(item => {
            const effectiveTimeRemaining = item.timeRemaining - (1 * (factory.efficiency / 100));
            if (effectiveTimeRemaining <= 0) {
              const itemInfo = ITEM_DATABASE[item.itemId];
              tempInventory[item.itemId] = (tempInventory[item.itemId] || 0) + item.quantity;
              allNewEvents.push(`Producción de ${item.quantity}x ${itemInfo.name} completada.`);
            } else {
              remainingQueue.push({ ...item, timeRemaining: effectiveTimeRemaining });
            }
          });
          return { ...factory, productionQueue: remainingQueue };
        }
        return b;
      });

      let moneyFromLogistics = 0;
      const updatedTrucks = gameState.trucks.map(truck => {
          if (truck.status === 'IDLE') return truck;
          const newTime = truck.timeRemaining - 1;
          if (newTime > 0) return { ...truck, timeRemaining: newTime };
          const contract = gameState.contracts.find(c => c.id === truck.jobId);
          if (!contract) return { ...truck, status: 'IDLE' as const, jobId: null, timeRemaining: 0 };
          if (truck.status === 'DELIVERING') {
              allNewEvents.push(`Camión ${truck.name} ha llegado a su destino para el contrato ${contract.itemId}.`);
              return { ...truck, status: 'RETURNING' as const, timeRemaining: contract.travelTime };
          }
          if (truck.status === 'RETURNING') {
              allNewEvents.push(`Camión ${truck.name} ha regresado a la base.`);
              if(contract.type === 'SELL') {
                  moneyFromLogistics += contract.reward;
                  allNewEvents.push(`¡Contrato de venta completado! +$${contract.reward.toLocaleString()}`);
              } else {
                  tempInventory[contract.itemId] = (tempInventory[contract.itemId] || 0) + contract.quantity;
                  allNewEvents.push(`¡Contrato de compra completado! +${contract.quantity.toLocaleString()}x ${ITEM_DATABASE[contract.itemId].name}`);
              }
              return { ...truck, status: 'IDLE' as const, jobId: null, timeRemaining: 0 };
          }
          return truck;
      });

      let updatedContracts = gameState.contracts.map(c => {
          const completingTruck = updatedTrucks.find(t => t.jobId === c.id && t.status === 'IDLE');
          return completingTruck ? { ...c, status: 'COMPLETED' as const } : c;
      }).filter(c => c.status !== 'COMPLETED');

      let nextContractDate = gameState.nextContractDate;
      const logisticsCenter = gameState.buildings.find(b => b.type === 'CENTRO_LOGISTICA') as ILogisticsCenter | undefined;

      if (logisticsCenter && gameState.date >= gameState.nextContractDate) {
        allNewEvents.push("Nuevos informes de mercado han llegado al Centro de Logística.");
        const maxContracts = logisticsCenter.level;

        const factories = gameState.buildings.filter(b => b.type === 'FABRICA') as IFactory[];
        const maxFactoryLevel = factories.length > 0 ? Math.max(...factories.map(f => f.level)) : 0;

        const sellableItems = Object.entries(ITEM_DATABASE).filter(([,item]) => item.recipe && (item.requiredFactoryLevel || 1) <= maxFactoryLevel);
        const buyableItems = Object.entries(ITEM_DATABASE).filter(([,item]) => !item.recipe);

        while(updatedContracts.filter(c => c.status === 'PENDING').length < maxContracts) {
          const contractType: ContractType = Math.random() < 0.3 ? 'BUY' : 'SELL';

          if (contractType === 'SELL' && sellableItems.length === 0) continue;
          if (contractType === 'BUY' && buyableItems.length === 0) continue;

          const [itemId, itemData] = contractType === 'SELL'
            ? sellableItems[Math.floor(Math.random() * sellableItems.length)]
            : buyableItems[Math.floor(Math.random() * buyableItems.length)];

          const maxContractValue = gameState.companyValue * 0.1;
          const targetValue = Math.random() * maxContractValue;

          const itemPrice = contractType === 'SELL' ? itemData.baseSellPrice : itemData.baseCost;
          const quantity = Math.max(1, Math.floor(targetValue / itemPrice));

          const travelTime = Math.floor(Math.random() * 3) + 1;
          const profitMargin = 1 + (Math.random() * 0.15 + 0.05);
          const costPremium = 1 + (Math.random() * 0.10 + 0.05);

          const reward = contractType === 'SELL'
            ? Math.floor(quantity * itemData.baseSellPrice * profitMargin)
            : -Math.floor(quantity * itemData.baseCost * costPremium);

          updatedContracts.push({ id: nanoid(), type: contractType, status: 'PENDING', itemId, quantity, reward, travelTime });
        }
        const nextContractInDays = Math.floor(Math.random() * 5) + 3;
        nextContractDate = new Date(gameState.date.getTime() + nextContractInDays * 86400000);
      }

      const dailyIncome = 500;
      const totalMaintenanceCost = updatedBuildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
      const finalDailyCosts = 150 + totalMaintenanceCost;
      const netIncome = dailyIncome - finalDailyCosts;
      const moneyChange = netIncome + moneyFromLogistics;
      allNewEvents.push(`Resumen diario. Ingresos: $${(dailyIncome + moneyFromLogistics).toLocaleString()}, Costos: $${finalDailyCosts.toLocaleString()}, Neto: $${moneyChange.toLocaleString()}`);

      dispatch({ type: GameActionType.ADVANCE_DAY, payload: { updatedBuildings, updatedTrucks, updatedContracts, newInventory: tempInventory, moneyChange, newEvents: allNewEvents, nextContractDate }});

      toastsToShow.forEach(toast => addToast(toast.message, toast.type));
      resolve();
    }));
  };

  const purchaseBuilding = async (type: BuildingType) => {
    await withLoading(() => new Promise<void>(resolve => {
      const buildingInfo = BUILDING_DATA[type];
      if (gameState.money < buildingInfo.cost) {
        addToast("¡No tienes suficiente dinero!", 'error');
        resolve();
        return;
      }
      const id = `${type}-${gameState.buildings.filter(b => b.type === type).length + 1}`;
      let newBuilding: Building;
      switch (type) {
          case 'FABRICA':
            newBuilding = { id, type, level: 1, productionSlots: 2, efficiency: 100, maintenanceCost: 100, productionQueue: [] };
            break;
          case 'ALMACEN':
            newBuilding = { id, type, level: 1, capacity: 1000, maintenanceCost: 50 };
            break;
          case 'LABORATORIO_ID':
            newBuilding = { id, type, level: 1, researchSlots: 1, researchPointsPerDay: 5, maintenanceCost: 200 };
            break;
          case 'OFICINA_MARKETING':
            newBuilding = { id, type, level: 1, campaignSlots: 1, brandAwareness: 10, maintenanceCost: 120 };
            break;
          case 'DEPARTAMENTO_RRHH':
            newBuilding = { id, type, level: 1, maxEmployees: 10, trainingSpeedBonus: 0, maintenanceCost: 80 };
            break;
          case 'CENTRO_LOGISTICA':
            newBuilding = { id, type, level: 1, shippingCostReduction: 2, truckSlots: 1, maintenanceCost: 150 };
            break;
      }
      const event = `¡${buildingInfo.name} construido exitosamente!`;
      dispatch({ type: GameActionType.PURCHASE_BUILDING, payload: { newBuilding, cost: buildingInfo.cost, event }});
      addToast(event, 'success');
      resolve();
    }));
  };

  const startProduction = async (factoryId: string, itemId: ItemId, quantity: number) => {
    await withLoading(() => new Promise<void>(resolve => {
      const factory = gameState.buildings.find(b => b.id === factoryId) as IFactory | undefined;
      const itemInfo = ITEM_DATABASE[itemId];
      if (!factory || !itemInfo || !itemInfo.recipe || !itemInfo.productionTime) { resolve(); return; }
      if (factory.productionQueue.length >= factory.productionSlots) { addToast("No hay espacios de producción disponibles.", 'error'); resolve(); return; }
      if (factory.level < (itemInfo.requiredFactoryLevel || 1)) { addToast(`Se requiere Nivel ${itemInfo.requiredFactoryLevel} para producir ${itemInfo.name}.`, 'error'); resolve(); return; }
      const newInventory = { ...gameState.inventory };
      for (const ingredient of itemInfo.recipe) {
        if ((newInventory[ingredient.id] || 0) < ingredient.amount * quantity) {
          addToast(`Recursos insuficientes para ${itemInfo.name}.`, 'error');
          resolve();
          return;
        }
        newInventory[ingredient.id] -= ingredient.amount * quantity;
      }
      const newQueueItem: ProductionQueueItem = { itemId, quantity, timeRemaining: itemInfo.productionTime * quantity };
      const event = `Iniciada la producción de ${quantity}x ${itemInfo.name}.`;
      dispatch({ type: GameActionType.START_PRODUCTION, payload: { factoryId, newQueueItem, newInventory, event }});
      addToast(`Iniciada la producción de ${quantity}x ${itemInfo.name}.`, 'success');
      resolve();
    }));
  };

  const upgradeBuilding = async (buildingId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
      const building = gameState.buildings.find(b => b.id === buildingId);
      if (!building) { resolve(); return; }
      const upgradeInfo = UPGRADE_DATA[building.type];
      const nextLevel = building.level + 1;
      if (nextLevel > upgradeInfo.maxLevel) { addToast("Este edificio ya ha alcanzado su nivel máximo.", 'info'); resolve(); return; }
      const upgradeCost = upgradeInfo.levels[nextLevel].cost;
      if (gameState.money < upgradeCost) { addToast("No tienes suficiente dinero para esta mejora.", 'error'); resolve(); return; }
      const event = `¡${BUILDING_DATA[building.type].name} mejorado a Nivel ${nextLevel}!`;
      dispatch({ type: GameActionType.UPGRADE_BUILDING, payload: { buildingId, nextLevel, newStats: upgradeInfo.levels[nextLevel], cost: upgradeCost, event } });
      addToast(event, 'success');
      resolve();
    }));
  };

  const sellItem = async (itemId: ItemId, quantity: number) => {
    await withLoading(() => new Promise<void>(resolve => {
      const itemInfo = ITEM_DATABASE[itemId];
      const currentAmount = gameState.inventory[itemId] || 0;
      if (!itemInfo) { addToast("El objeto no existe.", 'error'); resolve(); return; }
      if (quantity <= 0) { addToast("La cantidad debe ser positiva.", 'error'); resolve(); return; }
      if (currentAmount < quantity) { addToast(`No tienes suficientes ${itemInfo.name}.`, 'error'); resolve(); return; }
      const moneyGained = quantity * itemInfo.baseSellPrice;
      const event = `Vendiste ${quantity.toLocaleString()}x ${itemInfo.name} por $${moneyGained.toLocaleString()}.`;
      dispatch({ type: GameActionType.SELL_ITEM, payload: { itemId, quantity, moneyGained, event } });
      addToast(event, 'success');
      resolve();
    }));
  };

  const acceptContract = async (contractId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
        const contract = gameState.contracts.find(c => c.id === contractId);
        if (!contract) { addToast("El contrato ya no está disponible.", 'error'); resolve(); return; }
        const idleTruck = gameState.trucks.find(t => t.status === 'IDLE');
        if (!idleTruck) { addToast("No hay camiones disponibles para este contrato.", 'error'); resolve(); return; }
        let cost = 0;
        const newInventory = { ...gameState.inventory };
        if (contract.type === 'SELL') {
            const currentStock = newInventory[contract.itemId] || 0;
            if (currentStock < contract.quantity) {
                addToast(`No tienes suficientes ${ITEM_DATABASE[contract.itemId].name} para este contrato.`, 'error');
                resolve();
                return;
            }
            newInventory[contract.itemId] -= contract.quantity;
        } else {
            cost = -contract.reward;
            if (gameState.money < cost) {
                addToast("No tienes suficiente dinero para comprar estos recursos.", 'error');
                resolve();
                return;
            }
        }
        const event = `Contrato de ${contract.type === 'SELL' ? 'venta' : 'compra'} aceptado. Camión ${idleTruck.name} en camino.`;
        dispatch({ type: GameActionType.ACCEPT_CONTRACT, payload: { contractId, truckId: idleTruck.id, newInventory, cost, event } });
        addToast("¡Contrato aceptado!", 'success');
        resolve();
    }));
  };

  const purchaseTruck = async () => {
    await withLoading(() => new Promise<void>(resolve => {
        const logisticsCenters = gameState.buildings.filter(b => b.type === 'CENTRO_LOGISTICA');
        const totalTruckSlots = logisticsCenters.reduce((sum, lc) => sum + (lc as any).truckSlots, 0);
        if (gameState.trucks.length >= totalTruckSlots) {
            addToast("No tienes espacios disponibles para más camiones. Mejora tu Centro de Logística.", 'error');
            resolve();
            return;
        }
        if (gameState.money < TRUCK_COST) {
            addToast("No tienes suficiente dinero para comprar un camión.", 'error');
            resolve();
            return;
        }
        const truckId = `truck-${gameState.trucks.length + 1}`;
        const newTruck: ITruck = { id: truckId, name: `Camión ${gameState.trucks.length + 1}`, status: 'IDLE', jobId: null, timeRemaining: 0 };
        const event = `¡Has comprado un nuevo ${newTruck.name}!`;
        dispatch({ type: GameActionType.PURCHASE_TRUCK, payload: { newTruck, cost: TRUCK_COST, event }});
        addToast(event, 'success');
        resolve();
    }));
  };

  const value = { gameState, advanceDay, purchaseBuilding, startProduction, upgradeBuilding, sellItem, acceptContract, purchaseTruck };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}