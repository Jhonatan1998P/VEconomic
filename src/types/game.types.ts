// --- START OF FILE VEconomic-main/src/types/game.types.ts ---

export type BuildingType = 'FABRICA' | 'ALMACEN' | 'LABORATORIO_ID' | 'OFICINA_MARKETING' | 'DEPARTAMENTO_RRHH' | 'CENTRO_LOGISTICA';

export type ItemId = string;
export type ItemCategory = 'BASE' | 'COMPONENT' | 'ELECTRODOMESTICO' | 'ELECTRONICO';

export type EmployeeSpecialty = 'FACTORY_MANAGER' | 'LOGISTICS_COORDINATOR' | 'SALES_EXECUTIVE' | 'RESEARCH_LEAD';

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
  managerId: string | null;
}

export interface IWarehouse extends IBuildingBase {
  type: 'ALMACEN';
  capacity: number;
}

export interface IResearchLab extends IBuildingBase {
  type: 'LABORATORIO_ID';
  researchSlots: number;
  researchPointsPerDay: number;
  managerId: string | null;
}

export interface IMarketingOffice extends IBuildingBase {
  type: 'OFICINA_MARKETING';
  campaignSlots: number;
  brandAwareness: number;
  managerId: string | null;
}

export interface IHumanResourcesDept extends IBuildingBase {
  type: 'DEPARTAMENTO_RRHH';
  maxEmployees: number;
  recruitmentLevel: number; // Affects quality of candidates
}

export interface ILogisticsCenter extends IBuildingBase {
  type: 'CENTRO_LOGISTICA';
  shippingCostReduction: number;
  truckSlots: number;
  managerId: string | null;
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

export interface IEmployee {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F';
  specialty: EmployeeSpecialty;
  skillLevel: number; // e.g., 1-100
  salary: number; // daily
  status: 'UNASSIGNED' | 'ASSIGNED';
  assignedBuildingId: string | null;
}

export interface ICandidate extends IEmployee {
  hiringFee: number;
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
  employees: IEmployee[];
  candidates: ICandidate[];
  nextCandidateRefreshDate: Date;
}