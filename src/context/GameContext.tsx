import React, { createContext, useState, ReactNode } from 'react';
import { 
  IGameState, Building, BuildingType, IFactory, IWarehouse, IResearchLab, 
  IMarketingOffice, IHumanResourcesDept, ILogisticsCenter, ItemId 
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
}

export const GameContext = createContext<IGameContextType>({} as IGameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<IGameState>(INITIAL_GAME_STATE);

  const advanceDay = () => {
    setGameState(prevState => {
      const dailyIncome = 500;
      const totalMaintenanceCost = prevState.buildings.reduce((sum, building) => sum + building.maintenanceCost, 0);
      const dailyCosts = 150 + totalMaintenanceCost;
      const netIncome = dailyIncome - dailyCosts;

      if (prevState.money < dailyCosts) {
        alert("¡Fondos insuficientes para cubrir los costos operativos diarios!");
        return prevState;
      }

      const nextDay = new Date(prevState.date.getTime() + 86400000);

      return {
        ...prevState,
        money: prevState.money + netIncome,
        date: nextDay,
        events: [`Día avanzado. Ingresos: $${dailyIncome.toLocaleString()}, Costos: $${dailyCosts.toLocaleString()}`, ...prevState.events].slice(0, 10)
      };
    });
  };

  const purchaseBuilding = (type: BuildingType) => {
    const buildingInfo = BUILDING_DATA[type];

    setGameState(prevState => {
      if (prevState.money < buildingInfo.cost) {
        alert("¡No tienes suficiente dinero!");
        return prevState;
      }

      let newBuilding: Building;
      const id = `${type}-${prevState.buildings.filter(b => b.type === type).length + 1}`;

      switch (type) {
        case 'FABRICA':
          newBuilding = { id, type: 'FABRICA', level: 1, productionSlots: 2, efficiency: 60, maintenanceCost: 100 } as IFactory;
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
        default:
          return prevState;
      }

      return {
        ...prevState,
        money: prevState.money - buildingInfo.cost,
        companyValue: prevState.companyValue + buildingInfo.cost,
        buildings: [...prevState.buildings, newBuilding],
        events: [`¡Construido: ${buildingInfo.name}!`, ...prevState.events].slice(0, 10),
      };
    });
  };

  const value = { gameState, advanceDay, purchaseBuilding };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}