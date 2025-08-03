// --- START OF FILE VEconomic-main/src/context/GameContext.tsx ---

import React, { createContext, useReducer, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { useLoading } from '../hooks/useLoading';
import { IGameState, Building, BuildingType, IFactory, ItemId, ProductionQueueItem } from '../types/game.types';
import { INITIAL_GAME_STATE } from '../core/initialState';
import { ITEM_DATABASE } from '../core/game-data/items';
import { UPGRADE_DATA } from '../core/game-data/upgrades';
import { gameReducer } from './gameReducer';
import { GameActionType } from './gameActionTypes';

export const BUILDING_DATA = {
  FABRICA: { name: 'Fábrica', cost: 5000, icon: 'factory' },
  ALMACEN: { name: 'Almacén', cost: 2500, icon: 'warehouse' },
  LABORATORIO_ID: { name: 'Laboratorio I+D', cost: 7000, icon: 'lab' },
  OFICINA_MARKETING: { name: 'Oficina de Marketing', cost: 4000, icon: 'marketing' },
  DEPARTAMENTO_RRHH: { name: 'Departamento de RRHH', cost: 3500, icon: 'hr' },
  CENTRO_LOGISTICA: { name: 'Centro de Logística', cost: 6000, icon: 'logistics' },
};

interface IGameContextType {
  gameState: IGameState;
  advanceDay: () => Promise<void>;
  purchaseBuilding: (type: BuildingType) => Promise<void>;
  startProduction: (factoryId: string, itemId: ItemId, quantity: number) => Promise<void>;
  upgradeBuilding: (buildingId: string) => Promise<void>;
}

export const GameContext = createContext<IGameContextType>({} as IGameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
  const { addToast } = useToast();
  const { withLoading } = useLoading();

  const advanceDay = async () => {
    await withLoading(() => new Promise<void>(resolve => {
      const dailyCosts = 150 + gameState.buildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
      if (gameState.money < dailyCosts) {
        addToast("¡Fondos insuficientes para cubrir los costos diarios!", 'error');
        resolve();
        return;
      }

      let newEvents: string[] = [];
      const newInventory = { ...gameState.inventory };
      const toastsToShow: { message: string, type: 'success' | 'error' }[] = [];

      const updatedBuildings = gameState.buildings.map(b => {
        if (b.type === 'FABRICA') {
          const factory = b as IFactory;
          const factoryInfo = BUILDING_DATA[factory.type];
          const remainingQueue: ProductionQueueItem[] = [];

          factory.productionQueue.forEach(item => {
            const effectiveTimeRemaining = item.timeRemaining - (1 * (factory.efficiency / 100));
            if (effectiveTimeRemaining <= 0) {
              const itemInfo = ITEM_DATABASE[item.itemId];
              newInventory[item.itemId] = (newInventory[item.itemId] || 0) + item.quantity;
              const eventMsg = `Producción de ${item.quantity}x ${itemInfo.name} completada en la ${factoryInfo.name}.`;
              newEvents.push(eventMsg);
              toastsToShow.push({ message: eventMsg, type: 'success' });
            } else {
              remainingQueue.push({ ...item, timeRemaining: effectiveTimeRemaining });
            }
          });
          return { ...factory, productionQueue: remainingQueue };
        }
        return b;
      });

      const dailyIncome = 500;
      const totalMaintenanceCost = updatedBuildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
      const finalDailyCosts = 150 + totalMaintenanceCost;
      const netIncome = dailyIncome - finalDailyCosts;
      newEvents.push(`Día avanzado. Ingresos: $${dailyIncome.toLocaleString()}, Costos: $${finalDailyCosts.toLocaleString()}`);

      dispatch({ type: GameActionType.ADVANCE_DAY, payload: { newInventory, updatedBuildings, netIncome, newEvents } });
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
            newBuilding = { id, type, level: 1, shippingCostReduction: 2, supplyChainSlots: 1, maintenanceCost: 150 };
            break;
      }

      dispatch({ type: GameActionType.PURCHASE_BUILDING, payload: { newBuilding, cost: buildingInfo.cost }});
      addToast(`¡${buildingInfo.name} construido exitosamente!`, 'success');
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
      const event = `Iniciada la producción de ${quantity}x ${itemInfo.name} en la ${BUILDING_DATA[factory.type].name}.`;

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

  const value = { gameState, advanceDay, purchaseBuilding, startProduction, upgradeBuilding };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}