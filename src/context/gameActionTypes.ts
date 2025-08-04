// --- START OF FILE VEconomic-main/src/context/gameActionTypes.ts ---

import { Building, ItemId, ProductionQueueItem, IContract, ITruck, ICandidate, IEmployee } from "../types/game.types";

export enum GameActionType {
  ADVANCE_DAY = 'ADVANCE_DAY',
  PURCHASE_BUILDING = 'PURCHASE_BUILDING',
  START_PRODUCTION = 'START_PRODUCTION',
  UPGRADE_BUILDING = 'UPGRADE_BUILDING',
  SELL_ITEM = 'SELL_ITEM',
  ACCEPT_CONTRACT = 'ACCEPT_CONTRACT',
  PURCHASE_TRUCK = 'PURCHASE_TRUCK',

  // HR Actions
  HIRE_EMPLOYEE = 'HIRE_EMPLOYEE',
  FIRE_EMPLOYEE = 'FIRE_EMPLOYEE',
  ASSIGN_EMPLOYEE = 'ASSIGN_EMPLOYEE',
  UNASSIGN_EMPLOYEE = 'UNASSIGN_EMPLOYEE',
  REFRESH_CANDIDATES = 'REFRESH_CANDIDATES',
}

export type GameAction =
  | { type: GameActionType.ADVANCE_DAY; payload: { updatedBuildings: Building[]; updatedTrucks: ITruck[]; updatedContracts: IContract[]; newInventory: Record<ItemId, number>; moneyChange: number; newEvents: string[]; nextContractDate: Date } }
  | { type: GameActionType.PURCHASE_BUILDING; payload: { newBuilding: Building; cost: number; event: string } }
  | { type: GameActionType.START_PRODUCTION; payload: { factoryId: string; newQueueItem: ProductionQueueItem; newInventory: Record<ItemId, number>; event: string } }
  | { type: GameActionType.UPGRADE_BUILDING; payload: { buildingId: string; nextLevel: number; newStats: any; cost: number; event: string } }
  | { type: GameActionType.SELL_ITEM; payload: { itemId: ItemId; quantity: number; moneyGained: number; event: string } }
  | { type: GameActionType.ACCEPT_CONTRACT; payload: { contractId: string; truckId: string; newInventory: Record<ItemId, number>; cost: number; event: string } }
  | { type: GameActionType.PURCHASE_TRUCK; payload: { newTruck: ITruck; cost: number; event: string } }
  | { type: GameActionType.HIRE_EMPLOYEE; payload: { candidate: ICandidate; event: string } }
  | { type: GameActionType.FIRE_EMPLOYEE; payload: { employeeId: string; severanceCost: number; event: string } }
  | { type: GameActionType.ASSIGN_EMPLOYEE; payload: { employeeId: string; buildingId: string; event: string } }
  | { type: GameActionType.UNASSIGN_EMPLOYEE; payload: { employeeId: string; buildingId: string; event: string } }
  | { type: GameActionType.REFRESH_CANDIDATES; payload: { newCandidates: ICandidate[], nextDate: Date, event: string } };