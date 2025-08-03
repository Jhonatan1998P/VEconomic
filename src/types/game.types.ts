// --- START OF FILE VEconomic-main/src/types/game.types.ts ---

export type BuildingType = 'FABRICA' | 'ALMACEN' | 'LABORATORIO_ID' | 'OFICINA_MARKETING' | 'DEPARTAMENTO_RRHH' | 'CENTRO_LOGISTICA';

export type ItemId = string;
export type ItemCategory = 'BASE' | 'COMPONENT' | 'ELECTRODOMESTICO' | 'ELECTRONICO';

export interface RecipeItem {
  id: ItemId;
  amount: number;
}

export interface ProductionQueueItem {
  itemId: ItemId;
  quantity: number;
  timeRemaining: number;
}

export interface ItemDefinition {
  name: string;
  category: ItemCategory;
  volume: number;
  baseCost: number;
  baseSellPrice: number;
  recipe?: RecipeItem[];
  requiredFactoryLevel?: number;
  productionTime?: number;
}

interface IBuildingBase {
  id: string;
  type: BuildingType;
  level: number;
  maintenanceCost: number;
}

export interface IFactory extends IBuildingBase {
  type: 'FABRICA';
  productionSlots: number;
  efficiency: number;
  productionQueue: ProductionQueueItem[];
}

export interface IWarehouse extends IBuildingBase {
  type: 'ALMACEN';
  capacity: number;
}

export interface IResearchLab extends IBuildingBase {
  type: 'LABORATORIO_ID';
  researchSlots: number;
  researchPointsPerDay: number;
}

export interface IMarketingOffice extends IBuildingBase {
  type: 'OFICINA_MARKETING';
  campaignSlots: number;
  brandAwareness: number;
}

export interface IHumanResourcesDept extends IBuildingBase {
  type: 'DEPARTAMENTO_RRHH';
  maxEmployees: number;
  trainingSpeedBonus: number;
}

export interface ILogisticsCenter extends IBuildingBase {
  type: 'CENTRO_LOGISTICA';
  shippingCostReduction: number;
  truckSlots: number;
}

export type Building = IFactory | IWarehouse | IResearchLab | IMarketingOffice | IHumanResourcesDept | ILogisticsCenter;

export type TruckStatus = 'IDLE' | 'DELIVERING' | 'RETURNING';

export interface ITruck {
  id: string;
  name: string;
  status: TruckStatus;
  jobId: string | null;
  timeRemaining: number;
}

export type ContractType = 'SELL' | 'BUY';
export type ContractStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export interface IContract {
  id: string;
  type: ContractType;
  status: ContractStatus;
  itemId: ItemId;
  quantity: number;
  reward: number; // Positive for SELL, negative for BUY
  travelTime: number; // Time for one-way trip
}

export interface IGameState {
  playerName: string;
  money: number;
  date: Date;
  companyValue: number;
  inventory: Record<ItemId, number>;
  buildings: Building[];
  events: string[];
  trucks: ITruck[];
  contracts: IContract[];
  nextContractDate: Date;
}