import React, { createContext, useReducer, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { useLoading } from '../hooks/useLoading';
import { IGameState, Building, BuildingType, IFactory, ItemId, ProductionQueueItem, IContract, ITruck, ContractType, ILogisticsCenter, ICandidate, IHumanResourcesDept, EmployeeSpecialty } from '../types/game.types';
import { INITIAL_GAME_STATE } from '../core/initialState';
import { ITEM_DATABASE } from '../core/game-data/items';
import { UPGRADE_DATA } from '../core/game-data/upgrades';
import { gameReducer } from './gameReducer';
import { GameActionType } from './gameActionTypes';
import { nanoid } from 'nanoid';
import { SPECIALTY_DATA } from '../core/game-data/hr';
import { generateRandomName } from '../core/game-data/names';
import { generateNewContracts } from '../utils/contractGenerator';
import { TRUCK_COST } from '../core/constants';

export const BUILDING_DATA = {
  FABRICA: { name: 'Fábrica', cost: 5000, icon: 'factory' },
  ALMACEN: { name: 'Almacén', cost: 2500, icon: 'warehouse' },
  LABORATORIO_ID: { name: 'Laboratorio I+D', cost: 7000, icon: 'lab' },
  OFICINA_MARKETING: { name: 'Oficina de Marketing', cost: 4000, icon: 'marketing' },
  DEPARTAMENTO_RRHH: { name: 'Departamento de RRHH', cost: 3500, icon: 'hr' },
  CENTRO_LOGISTICA: { name: 'Centro de Logística', cost: 6000, icon: 'logistics' },
};

interface IGameContextType {
  gameState: IGameState;
  advanceDay: () => Promise<void>;
  purchaseBuilding: (type: BuildingType) => Promise<void>;
  startProduction: (factoryId: string, itemId: ItemId, quantity: number) => Promise<void>;
  upgradeBuilding: (buildingId: string) => Promise<void>;
  sellItem: (itemId: ItemId, quantity: number) => Promise<void>;
  acceptContract: (contractId: string) => Promise<void>;
  purchaseTruck: () => Promise<void>;
  hireEmployee: (candidateId: string) => Promise<void>;
  fireEmployee: (employeeId: string) => Promise<void>;
  assignEmployee: (employeeId: string, buildingId: string) => Promise<void>;
  unassignEmployee: (employeeId: string) => Promise<void>;
}

export const GameContext = createContext<IGameContextType>({} as IGameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
  const { addToast } = useToast();
  const { withLoading } = useLoading();

  const advanceDay = async () => {
    await withLoading(() => new Promise<void>(resolve => {
      const allNewEvents: string[] = [];
      const toastsToShow: { message: string, type: 'success' | 'error' }[] = [];
      let tempInventory = { ...gameState.inventory };
      let finalNextContractDate = gameState.nextContractDate;

      const dailyCosts = 150 + gameState.buildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
      if (gameState.money < dailyCosts) {
        addToast("¡Fondos insuficientes para cubrir los costos diarios!", 'error');
        resolve();
        return;
      }

      const updatedBuildings = gameState.buildings.map(b => {
        if (b.type === 'FABRICA') {
          const factory = b as IFactory;
          let finalEfficiency = factory.efficiency;

          if (factory.managerId) {
            const manager = gameState.employees.find(e => e.id === factory.managerId);
            if (manager) {
              const efficiencyBonus = manager.skillLevel / 2;
              finalEfficiency += efficiencyBonus;
            }
          }

          const remainingQueue: ProductionQueueItem[] = [];
          factory.productionQueue.forEach(item => {
            const effectiveTimeRemaining = item.timeRemaining - (1 * (finalEfficiency / 100));
            if (effectiveTimeRemaining <= 0) {
              const itemInfo = ITEM_DATABASE[item.itemId];
              tempInventory[item.itemId] = (tempInventory[item.itemId] || 0) + item.quantity;
              allNewEvents.push(`Producción de ${item.quantity}x ${itemInfo.name} completada en ${factory.id}.`);
            } else {
              remainingQueue.push({ ...item, timeRemaining: effectiveTimeRemaining });
            }
          });
          return { ...factory, productionQueue: remainingQueue };
        }
        return b;
      });

      let moneyFromLogistics = 0;
      const updatedTrucks = gameState.trucks.map(truck => {
          if (truck.status === 'IDLE') return truck;
          const newTime = truck.timeRemaining - 1;
          if (newTime > 0) return { ...truck, timeRemaining: newTime };
          const contract = gameState.contracts.find(c => c.id === truck.jobId);
          if (!contract) return { ...truck, status: 'IDLE' as const, jobId: null, timeRemaining: 0 };
          if (truck.status === 'DELIVERING') {
              allNewEvents.push(`Camión ${truck.name} ha llegado a su destino para el contrato ${contract.itemId}.`);
              return { ...truck, status: 'RETURNING' as const, timeRemaining: contract.travelTime };
          }
          if (truck.status === 'RETURNING') {
              allNewEvents.push(`Camión ${truck.name} ha regresado a la base.`);
              let updatedTruck = { ...truck, status: 'IDLE' as const, jobId: null, timeRemaining: 0, jobsCompleted: truck.jobsCompleted + 1 };
              if(contract.type === 'SELL') {
                  moneyFromLogistics += contract.reward;
                  updatedTruck.totalRevenue += contract.reward;
                  allNewEvents.push(`¡Contrato de venta completado! +$${contract.reward.toLocaleString()}`);
              } else {
                  tempInventory[contract.itemId] = (tempInventory[contract.itemId] || 0) + contract.quantity;
                  updatedTruck.totalExpenses += (-contract.reward); // Reward is negative for BUY contracts
                  allNewEvents.push(`¡Contrato de compra completado! +${contract.quantity.toLocaleString()}x ${ITEM_DATABASE[contract.itemId].name}`);
              }
              return updatedTruck;
          }
          return truck;
      });

      // Filter out completed contracts and expired contracts
      const MAX_PENDING_CONTRACTS = 10;
      let updatedContracts = gameState.contracts.filter(c => 
        c.status === 'ACTIVE' || (c.status === 'PENDING' && c.expirationDate.getTime() > gameState.date.getTime())
      );

      if (gameState.date >= gameState.nextCandidateRefreshDate) {
        const hrBuildings = gameState.buildings.filter(b => b.type === 'DEPARTAMENTO_RRHH') as IHumanResourcesDept[];
        if (hrBuildings.length > 0) {
          const totalRecruitmentLevel = hrBuildings.reduce((sum, b) => sum + b.recruitmentLevel, 0);
          const maxRecruitmentLevel = Math.max(...hrBuildings.map(b => b.recruitmentLevel));

          const newCandidates: ICandidate[] = [];
          const specialties = Object.keys(SPECIALTY_DATA) as EmployeeSpecialty[];

          for (let i = 0; i < totalRecruitmentLevel; i++) {
            const baseSkill = (maxRecruitmentLevel * 5) + (Math.log10(gameState.companyValue + 1) * 2);
            const skillVariance = (Math.random() - 0.4) * 20;
            const skillLevel = Math.max(1, Math.min(100, Math.round(baseSkill + skillVariance)));

            const salary = Math.round(50 + (skillLevel * 2) + (Math.sqrt(gameState.companyValue) / 10));
            const hiringFee = salary * (5 + Math.round(skillLevel / 10));
            const specialty = specialties[Math.floor(Math.random() * specialties.length)];

            newCandidates.push({
              id: nanoid(),
              name: generateRandomName(),
              age: Math.floor(Math.random() * 30) + 22,
              sex: Math.random() < 0.5 ? 'M' : 'F',
              specialty,
              skillLevel,
              salary,
              hiringFee,
              status: 'UNASSIGNED',
              assignedBuildingId: null,
            });
          }
          const nextDate = new Date(gameState.date.getTime() + 3 * 86400000);
          const event = "Nuevos candidatos han llegado al mercado laboral.";
          dispatch({ type: GameActionType.REFRESH_CANDIDATES, payload: { newCandidates, nextDate, event } });
        }
      }

      const logisticsCenter = gameState.buildings.find(b => b.type === 'CENTRO_LOGISTICA') as ILogisticsCenter | undefined;
      if (logisticsCenter && gameState.date >= gameState.nextContractDate) {
        allNewEvents.push("Nuevos informes de mercado han llegado al Centro de Logística.");
        
        const currentPendingCount = updatedContracts.filter(c => c.status === 'PENDING').length;
        const slotsAvailable = MAX_PENDING_CONTRACTS - currentPendingCount;

        if (slotsAvailable > 0) {
            const numToGenerate = Math.min(logisticsCenter.level, slotsAvailable);
            const newlyGeneratedContracts = generateNewContracts(gameState, numToGenerate, gameState.date);
            updatedContracts = [...updatedContracts, ...newlyGeneratedContracts];
        } else {
            allNewEvents.push("El mercado de contratos está lleno. No se generaron nuevas ofertas.");
        }

        const nextContractInDays = Math.floor(Math.random() * 5) + 3; // New contracts every 3-7 days
        finalNextContractDate = new Date(gameState.date.getTime() + nextContractInDays * 86400000);
      }

      const dailyIncome = 500;
      const totalMaintenanceCost = updatedBuildings.reduce((sum, b) => sum + b.maintenanceCost, 0);
      const finalDailyCosts = 150 + totalMaintenanceCost;
      const netIncome = dailyIncome - finalDailyCosts;
      const moneyChange = netIncome + moneyFromLogistics;
      allNewEvents.push(`Resumen diario. Ingresos: $${(dailyIncome + moneyFromLogistics).toLocaleString()}, Costos: $${finalDailyCosts.toLocaleString()}, Neto: $${moneyChange.toLocaleString()}`);

      dispatch({ type: GameActionType.ADVANCE_DAY, payload: { updatedBuildings, updatedTrucks, updatedContracts, newInventory: tempInventory, moneyChange, newEvents: allNewEvents, nextContractDate: finalNextContractDate }});

      toastsToShow.forEach(toast => addToast(toast.message, toast.type));
      resolve();
    }));
  };

  const purchaseBuilding = async (type: BuildingType) => {
    await withLoading(() => new Promise<void>(resolve => {
      const buildingInfo = BUILDING_DATA[type];
      if (gameState.money < buildingInfo.cost) {
        addToast("¡No tienes suficiente dinero!", 'error');
        resolve();
        return;
      }
      const id = `${type}-${gameState.buildings.filter(b => b.type === type).length + 1}`;
      let newBuilding: Building;
      switch (type) {
          case 'FABRICA':
            newBuilding = { id, type, level: 1, productionSlots: 2, efficiency: 100, maintenanceCost: 100, productionQueue: [], managerId: null };
            break;
          case 'ALMACEN':
            newBuilding = { id, type, level: 1, capacity: 1000, maintenanceCost: 50 };
            break;
          case 'LABORATORIO_ID':
            newBuilding = { id, type, level: 1, researchSlots: 1, researchPointsPerDay: 5, maintenanceCost: 200, managerId: null };
            break;
          case 'OFICINA_MARKETING':
            newBuilding = { id, type, level: 1, campaignSlots: 1, brandAwareness: 10, maintenanceCost: 120, managerId: null };
            break;
          case 'DEPARTAMENTO_RRHH':
            newBuilding = { id, type, level: 1, maxEmployees: 5, recruitmentLevel: 1, maintenanceCost: 80 };
            break;
          case 'CENTRO_LOGISTICA':
            newBuilding = { id, type, level: 1, shippingCostReduction: 2, truckSlots: 1, maintenanceCost: 150, managerId: null };
            break;
      }
      const event = `¡${buildingInfo.name} construido exitosamente!`;
      dispatch({ type: GameActionType.PURCHASE_BUILDING, payload: { newBuilding, cost: buildingInfo.cost, event }});
      addToast(event, 'success');
      resolve();
    }));
  };

  const startProduction = async (factoryId: string, itemId: ItemId, quantity: number) => {
    await withLoading(() => new Promise<void>(resolve => {
      const factory = gameState.buildings.find(b => b.id === factoryId) as IFactory | undefined;
      const itemInfo = ITEM_DATABASE[itemId];
      if (!factory || !itemInfo || !itemInfo.recipe || !itemInfo.productionTime) { resolve(); return; }
      if (factory.productionQueue.length >= factory.productionSlots) { addToast("No hay espacios de producción disponibles.", 'error'); resolve(); return; }
      if (factory.level < (itemInfo.requiredFactoryLevel || 1)) { addToast(`Se requiere Nivel ${itemInfo.requiredFactoryLevel} para producir ${itemInfo.name}.`, 'error'); resolve(); return; }
      const newInventory = { ...gameState.inventory };
      for (const ingredient of itemInfo.recipe) {
        if ((newInventory[ingredient.id] || 0) < ingredient.amount * quantity) {
          addToast(`Recursos insuficientes para ${itemInfo.name}.`, 'error');
          resolve();
          return;
        }
        newInventory[ingredient.id] -= ingredient.amount * quantity;
      }
      const newQueueItem: ProductionQueueItem = { itemId, quantity, timeRemaining: itemInfo.productionTime * quantity };
      const event = `Iniciada la producción de ${quantity}x ${itemInfo.name}.`;
      dispatch({ type: GameActionType.START_PRODUCTION, payload: { factoryId, newQueueItem, newInventory, event }});
      addToast(`Iniciada la producción de ${quantity}x ${itemInfo.name}.`, 'success');
      resolve();
    }));
  };

  const upgradeBuilding = async (buildingId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
      const building = gameState.buildings.find(b => b.id === buildingId);
      if (!building) { resolve(); return; }
      const upgradeInfo = UPGRADE_DATA[building.type];
      const nextLevel = building.level + 1;
      if (nextLevel > upgradeInfo.maxLevel) { addToast("Este edificio ya ha alcanzado su nivel máximo.", 'info'); resolve(); return; }
      const upgradeCost = upgradeInfo.levels[nextLevel].cost;
      if (gameState.money < upgradeCost) { addToast("No tienes suficiente dinero para esta mejora.", 'error'); resolve(); return; }
      const event = `¡${BUILDING_DATA[building.type].name} mejorado a Nivel ${nextLevel}!`;
      dispatch({ type: GameActionType.UPGRADE_BUILDING, payload: { buildingId, nextLevel, newStats: upgradeInfo.levels[nextLevel], cost: upgradeCost, event } });
      addToast(event, 'success');
      resolve();
    }));
  };

  const sellItem = async (itemId: ItemId, quantity: number) => {
    await withLoading(() => new Promise<void>(resolve => {
      const itemInfo = ITEM_DATABASE[itemId];
      const currentAmount = gameState.inventory[itemId] || 0;
      if (!itemInfo) { addToast("El objeto no existe.", 'error'); resolve(); return; }
      if (quantity <= 0) { addToast("La cantidad debe ser positiva.", 'error'); resolve(); return; }
      if (currentAmount < quantity) { addToast(`No tienes suficientes ${itemInfo.name}.`, 'error'); resolve(); return; }
      const moneyGained = quantity * itemInfo.baseSellPrice;
      const event = `Vendiste ${quantity.toLocaleString()}x ${itemInfo.name} por $${moneyGained.toLocaleString()}.`;
      dispatch({ type: GameActionType.SELL_ITEM, payload: { itemId, quantity, moneyGained, event } });
      addToast(event, 'success');
      resolve();
    }));
  };

  const acceptContract = async (contractId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
        const contract = gameState.contracts.find(c => c.id === contractId);
        if (!contract) { addToast("El contrato ya no está disponible.", 'error'); resolve(); return; }
        const idleTruck = gameState.trucks.find(t => t.status === 'IDLE');
        if (!idleTruck) { addToast("No hay camiones disponibles para este contrato.", 'error'); resolve(); return; }
        let cost = 0;
        const newInventory = { ...gameState.inventory };
        if (contract.type === 'SELL') {
            const currentStock = newInventory[contract.itemId] || 0;
            if (currentStock < contract.quantity) {
                addToast(`No tienes suficientes ${ITEM_DATABASE[contract.itemId].name} para este contrato.`, 'error');
                resolve();
                return;
            }
            newInventory[contract.itemId] -= contract.quantity;
        } else {
            cost = -contract.reward;
            if (gameState.money < cost) {
                addToast("No tienes suficiente dinero para comprar estos recursos.", 'error');
                resolve();
                return;
            }
        }
        const event = `Contrato de ${contract.type === 'SELL' ? 'venta' : 'compra'} aceptado. Camión ${idleTruck.name} en camino.`;
        dispatch({ type: GameActionType.ACCEPT_CONTRACT, payload: { contractId, truckId: idleTruck.id, newInventory, cost, event } });
        addToast("¡Contrato aceptado!", 'success');
        resolve();
    }));
  };

  const purchaseTruck = async () => {
    await withLoading(() => new Promise<void>(resolve => {
        const logisticsCenters = gameState.buildings.filter(b => b.type === 'CENTRO_LOGISTICA');
        const totalTruckSlots = logisticsCenters.reduce((sum, lc) => sum + (lc as any).truckSlots, 0);
        if (gameState.trucks.length >= totalTruckSlots) {
            addToast("No tienes espacios disponibles para más camiones. Mejora tu Centro de Logística.", 'error');
            resolve();
            return;
        }
        if (gameState.money < TRUCK_COST) {
            addToast("No tienes suficiente dinero para comprar un camión.", 'error');
            resolve();
            return;
        }
        const truckId = `truck-${gameState.trucks.length + 1}`;
        const newTruck: ITruck = { 
          id: truckId, 
          name: `Camión ${gameState.trucks.length + 1}`, 
          status: 'IDLE', 
          jobId: null, 
          timeRemaining: 0,
          purchaseCost: TRUCK_COST, // Initialize purchase cost
          totalRevenue: 0,
          totalExpenses: 0,
          jobsCompleted: 0,
        };
        const event = `¡Has comprado un nuevo ${newTruck.name}!`;
        dispatch({ type: GameActionType.PURCHASE_TRUCK, payload: { newTruck, cost: TRUCK_COST, event }});
        addToast(event, 'success');
        resolve();
    }));
  };

  const hireEmployee = async (candidateId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
        const hrBuildings = gameState.buildings.filter(b => b.type === 'DEPARTAMENTO_RRHH') as IHumanResourcesDept[];
        const totalMaxEmployees = hrBuildings.reduce((sum, b) => sum + b.maxEmployees, 0);
        if (hrBuildings.length > 0 && gameState.employees.length >= totalMaxEmployees) {
            addToast("Límite de empleados alcanzado. Mejora tu Departamento de RRHH para contratar más personal.", 'error');
            resolve();
            return;
        }

        const candidate = gameState.candidates.find(c => c.id === candidateId);
        if (!candidate) { addToast("Este candidato ya no está disponible.", 'error'); resolve(); return; }
        if (gameState.money < candidate.hiringFee) { addToast("No tienes suficiente dinero para la tarifa de contratación.", 'error'); resolve(); return; }

        const specialtyName = SPECIALTY_DATA[candidate.specialty].name;
        const event = `Has contratado a ${candidate.name} como tu nuevo ${specialtyName}.`;
        dispatch({ type: GameActionType.HIRE_EMPLOYEE, payload: { candidate, event } });
        addToast(`¡${candidate.name} ha sido contratado!`, 'success');
        resolve();
    }));
  };

  const fireEmployee = async (employeeId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
        const employee = gameState.employees.find(e => e.id === employeeId);
        if (!employee) { addToast("Empleado no encontrado.", 'error'); resolve(); return; }
        const severanceCost = employee.salary * 7;
        if (gameState.money < severanceCost) { addToast(`No tienes suficiente dinero para la indemnización ($${severanceCost.toLocaleString()}).`, 'error'); resolve(); return; }
        const event = `${employee.name} ha sido despedido. Se pagó una indemnización de $${severanceCost.toLocaleString()}.`;
        dispatch({ type: GameActionType.FIRE_EMPLOYEE, payload: { employeeId, severanceCost, event } });
        addToast(`${employee.name} ha sido despedido.`, 'info');
        resolve();
    }));
  };

  const assignEmployee = async (employeeId: string, buildingId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
        const employee = gameState.employees.find(e => e.id === employeeId);
        const building = gameState.buildings.find(b => b.id === buildingId);
        if (!employee || !building) { addToast("Empleado o edificio no válido.", 'error'); resolve(); return; }
        if ('managerId' in building && building.managerId !== null) {
            addToast("Este edificio ya tiene un gerente asignado.", 'error');
            resolve();
            return;
        }
        const event = `${employee.name} ha sido asignado a ${BUILDING_DATA[building.type].name} #${building.id.split('-')[1]}.`;
        dispatch({ type: GameActionType.ASSIGN_EMPLOYEE, payload: { employeeId, buildingId, event } });
        addToast("Empleado asignado.", 'success');
        resolve();
    }));
  };

  const unassignEmployee = async (employeeId: string) => {
    await withLoading(() => new Promise<void>(resolve => {
        const employee = gameState.employees.find(e => e.id === employeeId);
        if (!employee || !employee.assignedBuildingId) { addToast("Este empleado no está asignado.", 'error'); resolve(); return; }
        const building = gameState.buildings.find(b => b.id === employee.assignedBuildingId);
        const event = `${employee.name} ha sido retirado de su puesto en ${BUILDING_DATA[building!.type].name}.`;
        dispatch({ type: GameActionType.UNASSIGN_EMPLOYEE, payload: { employeeId, buildingId: employee.assignedBuildingId, event } });
        addToast("Empleado desasignado.", 'success');
        resolve();
    }));
  };

  const value = { gameState, advanceDay, purchaseBuilding, startProduction, upgradeBuilding, sellItem, acceptContract, purchaseTruck, hireEmployee, fireEmployee, assignEmployee, unassignEmployee };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}