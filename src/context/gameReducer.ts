// --- START OF FILE VEconomic-main/src/context/gameReducer.ts ---

import { IGameState } from "../types/game.types";
import { GameAction, GameActionType } from "./gameActionTypes";

export function gameReducer(state: IGameState, action: GameAction): IGameState {
  switch (action.type) {
    case GameActionType.ADVANCE_DAY: {
      const { updatedBuildings, updatedTrucks, updatedContracts, newInventory, moneyChange, newEvents, nextContractDate } = action.payload;
      return {
        ...state,
        money: state.money + moneyChange,
        date: new Date(state.date.getTime() + 86400000),
        buildings: updatedBuildings,
        inventory: newInventory,
        trucks: updatedTrucks,
        contracts: updatedContracts,
        events: [...newEvents, ...state.events].slice(0, 20),
        nextContractDate: nextContractDate,
      };
    }

    case GameActionType.PURCHASE_BUILDING: {
      const { newBuilding, cost, event } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        companyValue: state.companyValue + cost,
        buildings: [...state.buildings, newBuilding],
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.START_PRODUCTION: {
      const { factoryId, newQueueItem, newInventory, event } = action.payload;
      return {
        ...state,
        inventory: newInventory,
        buildings: state.buildings.map(b =>
          b.id === factoryId ? { ...b, productionQueue: [...(b as any).productionQueue, newQueueItem] } : b
        ),
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.UPGRADE_BUILDING: {
      const { buildingId, nextLevel, newStats, cost, event } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        companyValue: state.companyValue + cost,
        buildings: state.buildings.map(b =>
          b.id === buildingId ? { ...b, ...newStats, level: nextLevel } : b
        ),
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.SELL_ITEM: {
      const { itemId, quantity, moneyGained, event } = action.payload;
      const newInventory = { ...state.inventory };
      newInventory[itemId] -= quantity;
      if (newInventory[itemId] <= 0) {
        delete newInventory[itemId];
      }
      return {
        ...state,
        money: state.money + moneyGained,
        inventory: newInventory,
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.ACCEPT_CONTRACT: {
      const { contractId, truckId, newInventory, cost, event } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        inventory: newInventory,
        trucks: state.trucks.map(t => t.id === truckId ? { ...t, status: 'DELIVERING', jobId: contractId, timeRemaining: state.contracts.find(c=>c.id === contractId)!.travelTime } : t),
        contracts: state.contracts.map(c => c.id === contractId ? { ...c, status: 'ACTIVE' } : c),
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.PURCHASE_TRUCK: {
      const { newTruck, cost, event } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        companyValue: state.companyValue + cost,
        trucks: [...state.trucks, newTruck],
        events: [event, ...state.events].slice(0, 20),
      };
    }

    default:
      return state;
  }
}