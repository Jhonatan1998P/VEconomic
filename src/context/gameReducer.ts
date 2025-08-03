// --- START OF FILE VEconomic-main/src/context/gameReducer.ts ---

import { IGameState } from "../types/game.types";
import { GameAction, GameActionType } from "./gameActionTypes";

export function gameReducer(state: IGameState, action: GameAction): IGameState {
  switch (action.type) {
    case GameActionType.ADVANCE_DAY: {
      const { newInventory, updatedBuildings, netIncome, newEvents } = action.payload;
      return {
        ...state,
        money: state.money + netIncome,
        date: new Date(state.date.getTime() + 86400000),
        buildings: updatedBuildings,
        inventory: newInventory,
        events: [...newEvents, ...state.events].slice(0, 10),
      };
    }

    case GameActionType.PURCHASE_BUILDING: {
      const { newBuilding, cost } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        companyValue: state.companyValue + cost,
        buildings: [...state.buildings, newBuilding],
        events: [`¡Construido: ${newBuilding.type}!`, ...state.events].slice(0, 10),
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
        events: [event, ...state.events].slice(0, 10),
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
        events: [event, ...state.events].slice(0, 10),
      };
    }

    default:
      return state;
  }
}