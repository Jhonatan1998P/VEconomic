// --- START OF FILE VEconomic-main/src/core/game-data/upgrades.ts ---

import { BuildingType } from "../../types/game.types";

type UpgradeLevel = {
  cost: number;
  maintenanceCost: number;
  [key: string]: any; 
};

type BuildingUpgradeData = {
  maxLevel: number;
  levels: Record<number, UpgradeLevel>;
};

export const UPGRADE_DATA: Record<BuildingType, BuildingUpgradeData> = {
  FABRICA: {
    maxLevel: 5,
    levels: {
      2: { cost: 12000, maintenanceCost: 150, efficiency: 110, productionSlots: 3 },
      3: { cost: 25000, maintenanceCost: 220, efficiency: 125, productionSlots: 3 },
      4: { cost: 50000, maintenanceCost: 350, efficiency: 150, productionSlots: 4 },
      5: { cost: 100000, maintenanceCost: 500, efficiency: 200, productionSlots: 5 },
    }
  },
  ALMACEN: {
    maxLevel: 5,
    levels: {
      2: { cost: 5000, maintenanceCost: 75, capacity: 2500 },
      3: { cost: 12000, maintenanceCost: 110, capacity: 7000 },
      4: { cost: 28000, maintenanceCost: 160, capacity: 15000 },
      5: { cost: 60000, maintenanceCost: 250, capacity: 35000 },
    }
  },
  LABORATORIO_ID: { maxLevel: 1, levels: {} },
  OFICINA_MARKETING: { maxLevel: 1, levels: {} },
  DEPARTAMENTO_RRHH: {
    maxLevel: 5,
    levels: {
      2: { cost: 7500, maintenanceCost: 120, maxEmployees: 10, recruitmentLevel: 2 },
      3: { cost: 18000, maintenanceCost: 200, maxEmployees: 20, recruitmentLevel: 3 },
      4: { cost: 40000, maintenanceCost: 350, maxEmployees: 35, recruitmentLevel: 4 },
      5: { cost: 85000, maintenanceCost: 500, maxEmployees: 50, recruitmentLevel: 5 },
    }
  },
  CENTRO_LOGISTICA: { 
    maxLevel: 5,
    levels: {
      2: { cost: 15000, maintenanceCost: 250, truckSlots: 2, shippingCostReduction: 3 },
      3: { cost: 35000, maintenanceCost: 400, truckSlots: 3, shippingCostReduction: 4 },
      4: { cost: 70000, maintenanceCost: 600, truckSlots: 4, shippingCostReduction: 5 },
      5: { cost: 150000, maintenanceCost: 900, truckSlots: 5, shippingCostReduction: 7 },
    }
  },
};