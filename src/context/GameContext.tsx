// --- START OF FILE VEconomic-main/src/context/GameContext.tsx ---

import React, { createContext, useState, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { 
  IGameState, Building, BuildingType, IFactory, IWarehouse, IResearchLab, 
  IMarketingOffice, IHumanResourcesDept, ILogisticsCenter, ItemId, ProductionQueueItem
} from '../types/game.types';
import { INITIAL_GAME_STATE } from '../core/initialState';
import { ITEM_DATABASE } from '../core/game-data/items';

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
  advanceDay: () => void;
  purchaseBuilding: (type: BuildingType) => void;
  startProduction: (factoryId: string, itemId: ItemId, quantity: number) => void;
}

export const GameContext = createContext<IGameContextType>({} as IGameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<IGameState>(INITIAL_GAME_STATE);
  const { addToast } = useToast();

  const advanceDay = () => {
    const prevState = gameState;
    const toastsToShow: { message: string, type: 'success' | 'error' }[] = [];

    const dailyCosts = 150 + prevState.buildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
    if (prevState.money < dailyCosts) {
      addToast("¡Fondos insuficientes para cubrir los costos diarios!", 'error');
      return;
    }

    let newEvents: string[] = [];
    const newInventory = { ...prevState.inventory };

    const updatedBuildings = prevState.buildings.map(building => {
      if (building.type === 'FABRICA') {
        const factory = building as IFactory;
        const factoryInfo = BUILDING_DATA[factory.type];
        const remainingQueue: ProductionQueueItem[] = [];

        factory.productionQueue.forEach(item => {
          const timeReduction = factory.efficiency / 100;
          const effectiveTimeRemaining = item.timeRemaining - (1 * timeReduction);

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
      return building;
    });

    const dailyIncome = 500;
    const totalMaintenanceCost = updatedBuildings.reduce((sum, building) => sum + building.maintenanceCost, 0);
    const finalDailyCosts = 150 + totalMaintenanceCost;
    const netIncome = dailyIncome - finalDailyCosts;
    const nextDay = new Date(prevState.date.getTime() + 86400000);
    newEvents.push(`Día avanzado. Ingresos: $${dailyIncome.toLocaleString()}, Costos: $${finalDailyCosts.toLocaleString()}`);

    setGameState({
      ...prevState,
      money: prevState.money + netIncome,
      date: nextDay,
      buildings: updatedBuildings,
      inventory: newInventory,
      events: [...newEvents, ...prevState.events].slice(0, 10)
    });

    toastsToShow.forEach(toast => addToast(toast.message, toast.type));
  };

  const purchaseBuilding = (type: BuildingType) => {
    const buildingInfo = BUILDING_DATA[type];
    if (gameState.money < buildingInfo.cost) {
      addToast("¡No tienes suficiente dinero!", 'error');
      return;
    }

    setGameState(prevState => {
      const existingBuildings = prevState.buildings.filter(b => b.type === type);
      const id = `${type}-${existingBuildings.length + 1}`;
      let newBuilding: Building;

      switch (type) {
        case 'FABRICA':
          newBuilding = { id, type: 'FABRICA', level: 1, productionSlots: 2, efficiency: 100, maintenanceCost: 100, productionQueue: [] } as IFactory;
          break;
        case 'ALMACEN':
          newBuilding = { id, type: 'ALMACEN', level: 1, capacity: 1000, maintenanceCost: 50 } as IWarehouse;
          break;
        case 'LABORATORIO_ID':
          newBuilding = { id, type: 'LABORATORIO_ID', level: 1, researchSlots: 1, researchPointsPerDay: 5, maintenanceCost: 200 } as IResearchLab;
          break;
        case 'OFICINA_MARKETING':
          newBuilding = { id, type: 'OFICINA_MARKETING', level: 1, campaignSlots: 1, brandAwareness: 10, maintenanceCost: 120 } as IMarketingOffice;
          break;
        case 'DEPARTAMENTO_RRHH':
          newBuilding = { id, type: 'DEPARTAMENTO_RRHH', level: 1, maxEmployees: 10, trainingSpeedBonus: 0, maintenanceCost: 80 } as IHumanResourcesDept;
          break;
        case 'CENTRO_LOGISTICA':
          newBuilding = { id, type: 'CENTRO_LOGISTICA', level: 1, shippingCostReduction: 2, supplyChainSlots: 1, maintenanceCost: 150 } as ILogisticsCenter;
          break;
      }

      return {
        ...prevState,
        money: prevState.money - buildingInfo.cost,
        companyValue: prevState.companyValue + buildingInfo.cost,
        buildings: [...prevState.buildings, newBuilding],
        events: [`¡Construido: ${buildingInfo.name}!`, ...prevState.events].slice(0, 10),
      };
    });

    addToast(`¡${buildingInfo.name} construido exitosamente!`, 'success');
  };

  const startProduction = (factoryId: string, itemId: ItemId, quantity: number) => {
    const factory = gameState.buildings.find(b => b.id === factoryId) as IFactory | undefined;
    const itemInfo = ITEM_DATABASE[itemId];

    if (!factory || !itemInfo || !itemInfo.recipe || !itemInfo.productionTime) return;

    if (factory.productionQueue.length >= factory.productionSlots) {
      addToast("No hay espacios de producción disponibles.", 'error');
      return;
    }
    if (factory.level < (itemInfo.requiredFactoryLevel || 1)) {
      addToast(`Se requiere Nivel ${itemInfo.requiredFactoryLevel} para producir ${itemInfo.name}.`, 'error');
      return;
    }

    for (const ingredient of itemInfo.recipe) {
      if ((gameState.inventory[ingredient.id] || 0) < ingredient.amount * quantity) {
        addToast(`Recursos insuficientes para ${itemInfo.name}.`, 'error');
        return;
      }
    }

    setGameState(prevState => {
      const newInventory = { ...prevState.inventory };
      itemInfo.recipe!.forEach(ingredient => {
        newInventory[ingredient.id] -= ingredient.amount * quantity;
      });

      const newQueueItem: ProductionQueueItem = { itemId, quantity, timeRemaining: itemInfo.productionTime * quantity };
      const updatedBuildings = prevState.buildings.map(b => 
        b.id === factoryId ? { ...b, productionQueue: [...(b as IFactory).productionQueue, newQueueItem] } : b
      );

      const factoryInfo = BUILDING_DATA[factory.type];
      return {
        ...prevState,
        inventory: newInventory,
        buildings: updatedBuildings,
        events: [`Iniciada la producción de ${quantity}x ${itemInfo.name} en la ${factoryInfo.name}.`, ...prevState.events].slice(0, 10),
      };
    });

    addToast(`Iniciada la producción de ${quantity}x ${itemInfo.name}.`, 'success');
  };

  const value = { gameState, advanceDay, purchaseBuilding, startProduction };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}