// --- START OF FILE VEconomic-main/src/context/gameActionTypes.ts ---

import { Building, BuildingType, ItemId, ProductionQueueItem } from "../types/game.types";

export enum GameActionType {
  ADVANCE_DAY = 'ADVANCE_DAY',
  PURCHASE_BUILDING = 'PURCHASE_BUILDING',
  START_PRODUCTION = 'START_PRODUCTION',
  UPGRADE_BUILDING = 'UPGRADE_BUILDING',
  SELL_ITEM = 'SELL_ITEM',
}

export type GameAction =
  | { type: GameActionType.ADVANCE_DAY; payload: { newInventory: Record<ItemId, number>; updatedBuildings: Building[]; netIncome: number; newEvents: string[] } }
  | { type: GameActionType.PURCHASE_BUILDING; payload: { newBuilding: Building; cost: number } }
  | { type: GameActionType.START_PRODUCTION; payload: { factoryId: string; newQueueItem: ProductionQueueItem; newInventory: Record<ItemId, number>; event: string } }
  | { type: GameActionType.UPGRADE_BUILDING; payload: { buildingId: string; nextLevel: number; newStats: any; cost: number; event: string } }
| { type: GameActionType.SELL_ITEM; payload: { itemId: ItemId; quantity: number; moneyGained: number; event: string } };