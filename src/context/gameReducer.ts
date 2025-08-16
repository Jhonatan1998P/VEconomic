import { IGameState, IEmployee } from "../types/game.types";
import { GameAction, GameActionType } from "./gameActionTypes";

export function gameReducer(state: IGameState, action: GameAction): IGameState {
  switch (action.type) {
    case GameActionType.ADVANCE_DAY: {
      const { updatedBuildings, updatedTrucks, updatedContracts, newInventory, moneyChange, newEvents, nextContractDate } = action.payload;
      const totalSalaries = state.employees.reduce((sum, emp) => sum + emp.salary, 0);
      const finalMoneyChange = moneyChange - totalSalaries;

      const salaryEvent = `Se pagaron $${totalSalaries.toLocaleString()} en salarios.`;
      const finalEvents = totalSalaries > 0 ? [salaryEvent, ...newEvents] : newEvents;

      return {
        ...state,
        money: state.money + finalMoneyChange,
        date: new Date(state.date.getTime() + 86400000),
        buildings: updatedBuildings,
        inventory: newInventory,
        trucks: updatedTrucks,
        contracts: updatedContracts,
        events: [...finalEvents, ...state.events].slice(0, 20),
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

    case GameActionType.HIRE_EMPLOYEE: {
      const { candidate, event } = action.payload;
      const newEmployee: IEmployee = {
        id: candidate.id,
        name: candidate.name,
        specialty: candidate.specialty,
        skillLevel: candidate.skillLevel,
        salary: candidate.salary,
        status: 'UNASSIGNED',
        assignedBuildingId: null,
        age: candidate.age,
        sex: candidate.sex
      };
      return {
        ...state,
        money: state.money - candidate.hiringFee,
        employees: [...state.employees, newEmployee],
        candidates: state.candidates.filter(c => c.id !== candidate.id),
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.FIRE_EMPLOYEE: {
      const { employeeId, severanceCost, event } = action.payload;
      const employeeToFire = state.employees.find(e => e.id === employeeId);
      let updatedBuildings = state.buildings;

      if (employeeToFire?.assignedBuildingId) {
        updatedBuildings = state.buildings.map(b => {
          if ('managerId' in b && b.id === employeeToFire.assignedBuildingId) {
            return { ...b, managerId: null };
          }
          return b;
        });
      }

      return {
        ...state,
        money: state.money - severanceCost,
        employees: state.employees.filter(e => e.id !== employeeId),
        buildings: updatedBuildings,
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.ASSIGN_EMPLOYEE: {
      const { employeeId, buildingId, event } = action.payload;
      return {
        ...state,
        employees: state.employees.map(e => e.id === employeeId ? { ...e, status: 'UNASSIGNED', assignedBuildingId: buildingId } : e),
        buildings: state.buildings.map(b => b.id === buildingId ? { ...b, managerId: employeeId } : b),
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.UNASSIGN_EMPLOYEE: {
      const { employeeId, buildingId, event } = action.payload;
      return {
        ...state,
        employees: state.employees.map(e => e.id === employeeId ? { ...e, status: 'UNASSIGNED', assignedBuildingId: null } : e),
        buildings: state.buildings.map(b => b.id === buildingId ? { ...b, managerId: null } : b),
        events: [event, ...state.events].slice(0, 20),
      };
    }

    case GameActionType.REFRESH_CANDIDATES: {
      const { newCandidates, nextDate, event } = action.payload;
      return {
        ...state,
        candidates: newCandidates,
        nextCandidateRefreshDate: nextDate,
        events: [event, ...state.events].slice(0, 20),
      };
    }

    default:
      return state;
  }
}