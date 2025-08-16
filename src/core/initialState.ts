import { ICandidate, IGameState } from "../types/game.types";
import { nanoid } from 'nanoid';
import { TRUCK_COST } from "../core/constants";

const initialCandidates: ICandidate[] = [
  {
    id: nanoid(),
    name: "Juan Pérez",
    age: 34,
    sex: 'M',
    specialty: 'FACTORY_MANAGER',
    skillLevel: 25,
    salary: 150,
    hiringFee: 1000,
    status: 'UNASSIGNED',
    assignedBuildingId: null,
  },
  {
    id: nanoid(),
    name: "Ana García",
    age: 28,
    sex: 'F',
    specialty: 'FACTORY_MANAGER',
    skillLevel: 35,
    salary: 210,
    hiringFee: 1500,
    status: 'UNASSIGNED',
    assignedBuildingId: null,
  }
];

export function getInitialGameState(): IGameState {
  return {
    playerName: "CEO Novato",
    money: 10000,
    date: new Date(2025, 0, 1),
    companyValue: 10000 + 2500,
    inventory: {
      base_iron_ore: 50,
      base_copper_ore: 30,
      base_crude_oil: 20,
      base_sand: 40,
      base_wood: 100,
    },
    buildings: [
      {
        id: 'ALMACEN-1',
        type: 'ALMACEN',
        level: 1,
        capacity: 1000,
        maintenanceCost: 50
      },
      {
        id: 'FABRICA-1',
        type: 'FABRICA',
        level: 1,
        productionSlots: 2,
        efficiency: 100,
        maintenanceCost: 100,
        productionQueue: [],
        managerId: null,
      }
    ],
    events: ["¡Has fundado tu nueva empresa! ¡El futuro es tuyo!", "Has construido tu primer almacén para empezar."],
    trucks: [
      {
        id: nanoid(),
        name: "Camión Inicial",
        status: 'IDLE',
        jobId: null,
        timeRemaining: 0,
        purchaseCost: TRUCK_COST,
        totalRevenue: 0,
        totalExpenses: 0,
        jobsCompleted: 0,
      }
    ],
    contracts: [],
    nextContractDate: new Date(2025, 0, 2),
    employees: [],
    candidates: initialCandidates,
    nextCandidateRefreshDate: new Date(2025, 0, 4),
  };
}

export const INITIAL_GAME_STATE: IGameState = getInitialGameState();