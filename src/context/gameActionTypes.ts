// --- START OF FILE VEconomic-main/src/context/gameActionTypes.ts ---

import { Building, ItemId, ProductionQueueItem, IContract, ITruck } from "../types/game.types";

export enum GameActionType {
  ADVANCE_DAY = 'ADVANCE_DAY',
  PURCHASE_BUILDING = 'PURCHASE_BUILDING',
  START_PRODUCTION = 'START_PRODUCTION',
  UPGRADE_BUILDING = 'UPGRADE_BUILDING',
  SELL_ITEM = 'SELL_ITEM',
  ACCEPT_CONTRACT = 'ACCEPT_CONTRACT',
  PURCHASE_TRUCK = 'PURCHASE_TRUCK',
}

export type GameAction =
  | { type: GameActionType.ADVANCE_DAY; payload: { updatedBuildings: Building[]; updatedTrucks: ITruck[]; updatedContracts: IContract[]; newInventory: Record<ItemId, number>; moneyChange: number; newEvents: string[]; nextContractDate: Date } }
  | { type: GameActionType.PURCHASE_BUILDING; payload: { newBuilding: Building; cost: number; event: string } }
  | { type: GameActionType.START_PRODUCTION; payload: { factoryId: string; newQueueItem: ProductionQueueItem; newInventory: Record<ItemId, number>; event: string } }
  | { type: GameActionType.UPGRADE_BUILDING; payload: { buildingId: string; nextLevel: number; newStats: any; cost: number; event: string } }
  | { type: GameActionType.SELL_ITEM; payload: { itemId: ItemId; quantity: number; moneyGained: number; event: string } }
  | { type: GameActionType.ACCEPT_CONTRACT; payload: { contractId: string; truckId: string; newInventory: Record<ItemId, number>; cost: number; event: string } }
  | { type: GameActionType.PURCHASE_TRUCK; payload: { newTruck: ITruck; cost: number; event: string } };