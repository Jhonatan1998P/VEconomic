// --- START OF FILE VEconomic-main/src/features/hr/HRView.tsx ---

import React, { useState, useMemo } from 'react';
import { useGame } from '../../hooks/useGame';
import Icon from '../../icons/Icon';
import { IEmployee, ICandidate, IHumanResourcesDept } from '../../types/game.types';
import { SPECIALTY_DATA, SPECIALTY_ASSIGNMENT_MAP, SPECIALTY_BONUS_MAP } from '../../core/game-data/hr';
import { BUILDING_DATA } from '../../context/GameContext';
import { UPGRADE_DATA } from '../../core/game-data/upgrades';

export default function HRView() {
  const { gameState, upgradeBuilding } = useGame();
  const { employees, candidates, money, buildings } = gameState;
  const [assigningEmployee, setAssigningEmployee] = useState<IEmployee | null>(null);
  const [viewingPerson, setViewingPerson] = useState<IEmployee | ICandidate | null>(null);

  const hrBuilding = buildings.find(b => b.type === 'DEPARTAMENTO_RRHH') as IHumanResourcesDept | undefined;

  if (!hrBuilding) {
    return (
      <div className="text-center p-8 bg-gray-800/50 rounded-lg">
        <Icon name="hr" className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold text-yellow-400">Edificio Requerido</h2>
        <p className="text-gray-400 mt-2">Necesitas construir un Departamento de RRHH para gestionar empleados.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-cyan-300">Gestión de Recursos Humanos</h2>
        <p className="text-gray-400">Tu equipo es tu mayor activo. Contrata, gestiona y asigna talento para optimizar tu imperio.</p>
      </div>

      <HRUpgradePanel hrBuilding={hrBuilding} money={money} onUpgrade={upgradeBuilding} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-200">Tu Equipo ({employees.length})</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {employees.length > 0 ? (
              employees.map(emp => <EmployeeCard key={emp.id} employee={emp} onAssignClick={() => setAssigningEmployee(emp)} onViewDetails={() => setViewingPerson(emp)} />)
            ) : (
              <p className="text-gray-500 text-center py-8">No tienes empleados. ¡Contrata a tu primer talento!</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-200">Candidatos Disponibles ({candidates.length})</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {candidates.length > 0 ? (
              candidates.map(cand => <CandidateCard key={cand.id} candidate={cand} money={money} onViewDetails={() => setViewingPerson(cand)} />)
            ) : (
              <p className="text-gray-500 text-center py-8">No hay nuevos candidatos. El próximo informe llegará el {gameState.nextCandidateRefreshDate.toLocaleDateString()}.</p>
            )}
          </div>
        </section>
      </div>

      {assigningEmployee && (
        <AssignmentModal 
          employee={assigningEmployee}
          onClose={() => setAssigningEmployee(null)}
        />
      )}

      {viewingPerson && (
        <PersonDetailModal
          person={viewingPerson}
          onClose={() => setViewingPerson(null)}
        />
      )}
    </div>
  );
}

function HRUpgradePanel({ hrBuilding, money, onUpgrade }: { hrBuilding: IHumanResourcesDept, money: number, onUpgrade: (id: string) => void }) {
    const upgradeInfo = UPGRADE_DATA[hrBuilding.type];
    const nextLevel = hrBuilding.level + 1;
    const nextLevelInfo = upgradeInfo.levels[nextLevel];

    if (!nextLevelInfo) {
      return (
        <section className="bg-gray-800/50 p-4 rounded-lg shadow-inner text-center">
          <h2 className="text-xl font-semibold text-green-400">Mejora Máxima Alcanzada</h2>
          <p className="text-gray-400">Este departamento ya está a su máximo potencial.</p>
        </section>
      );
    }

    const canAfford = money >= nextLevelInfo.cost;

    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Mejorar Departamento</h2>
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left">
            <p className="text-gray-400">Nivel Actual</p>
            <p className="text-3xl font-bold text-white">{hrBuilding.level}</p>
            <p className="text-sm text-gray-300">Límite de Empleados: {hrBuilding.maxEmployees}</p>
            <p className="text-sm text-gray-300">Nivel de Reclutamiento: {hrBuilding.recruitmentLevel}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Icon name="chevron-down" className="w-10 h-10 text-cyan-400 rotate-[-90deg] md:hidden"/>
            <Icon name="chevron-down" className="w-10 h-10 text-cyan-400 md:rotate-0 hidden md:block mb-2"/>
            <button 
              onClick={() => onUpgrade(hrBuilding.id)}
              disabled={!canAfford}
              className={`w-full font-semibold py-3 px-6 rounded-md transition-colors text-white ${
                canAfford ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Mejorar por ${nextLevelInfo.cost.toLocaleString()}
            </button>
          </div>
          <div className="text-center md:text-right">
            <p className="text-cyan-400">Próximo Nivel</p>
            <p className="text-3xl font-bold text-cyan-300">{nextLevel}</p>
            <p className="text-sm text-cyan-300">Límite de Empleados: {nextLevelInfo.maxEmployees}</p>
            <p className="text-sm text-cyan-300">Nivel de Reclutamiento: {nextLevelInfo.recruitmentLevel}</p>
          </div>
        </div>
      </section>
    );
}

function EmployeeCard({ employee, onAssignClick, onViewDetails }: { employee: IEmployee, onAssignClick: () => void, onViewDetails: () => void }) {
    const { gameState, fireEmployee, unassignEmployee } = useGame();
    const specialty = SPECIALTY_DATA[employee.specialty];
    const assignedBuilding = employee.assignedBuildingId ? gameState.buildings.find(b => b.id === employee.assignedBuildingId) : null;

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border-l-4 border-cyan-500 flex flex-col">
        <button onClick={onViewDetails} className="p-4 text-left w-full hover:bg-gray-700/40 rounded-t-lg transition-colors">
            <div className="flex items-start justify-between">
            <div>
                <h4 className="text-xl font-bold text-white">{employee.name}</h4>
                <div className="flex items-center gap-2 text-cyan-300">
                <Icon name={specialty.icon} className="w-5 h-5" />
                <span className="text-sm font-semibold">{specialty.name}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-semibold text-white">Nivel: {employee.skillLevel}</p>
                <p className="text-sm text-red-400">${employee.salary.toLocaleString()}/día</p>
            </div>
            </div>
            {assignedBuilding && (
                <div className="mt-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded-md">
                    Asignado a: <span className="font-semibold">{BUILDING_DATA[assignedBuilding.type].name} ({assignedBuilding.id})</span>
                </div>
            )}
        </button>
        <div className="mt-auto p-2 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
          {employee.status === 'UNASSIGNED' ? (
            <button onClick={onAssignClick} className="w-full px-4 py-2 text-sm rounded-md font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2">
              <Icon name="arrow-right-on-rectangle" className="w-5 h-5" /> Asignar
            </button>
          ) : (
            <button onClick={() => unassignEmployee(employee.id)} className="w-full px-4 py-2 text-sm rounded-md font-semibold text-white transition-colors bg-yellow-600 hover:bg-yellow-500 flex items-center justify-center gap-2">
              <Icon name="x-mark" className="w-5 h-5" /> Desasignar
            </button>
          )}
          <button onClick={() => fireEmployee(employee.id)} className="w-full px-4 py-2 text-sm rounded-md font-semibold text-white transition-colors bg-red-700 hover:bg-red-600 flex items-center justify-center gap-2">
            <Icon name="user-minus" className="w-5 h-5" /> Despedir
          </button>
        </div>
      </div>
    );
}

function CandidateCard({ candidate, money, onViewDetails }: { candidate: ICandidate, money: number, onViewDetails: () => void }) {
    const { hireEmployee } = useGame();
    const specialty = SPECIALTY_DATA[candidate.specialty];
    const canAfford = money >= candidate.hiringFee;

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border-l-4 border-gray-600 flex flex-col">
        <button onClick={onViewDetails} className="p-4 text-left w-full hover:bg-gray-700/40 rounded-t-lg transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-xl font-bold text-white">{candidate.name}</h4>
                    <div className="flex items-center gap-2 text-gray-400">
                    <Icon name={specialty.icon} className="w-5 h-5" />
                    <span className="text-sm font-semibold">{specialty.name}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-white">Nivel: {candidate.skillLevel}</p>
                    <p className="text-sm text-red-400">${candidate.salary.toLocaleString()}/día</p>
                </div>
            </div>
        </button>
        <div className="mt-auto p-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-300">Tarifa: <span className="font-bold text-green-400">${candidate.hiringFee.toLocaleString()}</span></p>
            <button 
                onClick={() => hireEmployee(candidate.id)}
                disabled={!canAfford}
                className="px-6 py-2 rounded-md font-semibold text-white transition-colors bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Icon name="user-plus" className="w-5 h-5" /> Contratar
            </button>
        </div>
      </div>
    );
}

function AssignmentModal({ employee, onClose }: { employee: IEmployee, onClose: () => void }) {
  const { gameState, assignEmployee } = useGame();

  const compatibleBuildingTypes = SPECIALTY_ASSIGNMENT_MAP[employee.specialty];
  const availableBuildings = useMemo(() => 
    gameState.buildings.filter(b => 
      compatibleBuildingTypes.includes(b.type) && 'managerId' in b && b.managerId === null
    ), [gameState.buildings, compatibleBuildingTypes]);

  const handleAssign = (buildingId: string) => {
    assignEmployee(employee.id, buildingId);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Asignar a {employee.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="x-mark" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {availableBuildings.length > 0 ? (
            <ul className="space-y-3">
              {availableBuildings.map(building => (
                <li key={building.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-200">{BUILDING_DATA[building.type].name} ({building.id})</p>
                    <p className="text-sm text-gray-400">Nivel {building.level}</p>
                  </div>
                  <button onClick={() => handleAssign(building.id)} className="px-4 py-2 text-sm rounded-md font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-500">
                    Asignar aquí
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay edificios compatibles o disponibles para este empleado.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonDetailModal({ person, onClose }: { person: IEmployee | ICandidate, onClose: () => void }) {
    const specialty = SPECIALTY_DATA[person.specialty];
    const bonusDescription = SPECIALTY_BONUS_MAP[person.specialty](person.skillLevel);
    const isCandidate = 'hiringFee' in person;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end" onClick={onClose}>
            <div 
                className="bg-gray-800 w-full max-w-4xl border-t-2 border-cyan-400 rounded-t-2xl shadow-2xl max-h-[50vh] animate-slide-in-bottom"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Icon name="user-circle" className="w-8 h-8 text-gray-400" />
                        <h3 className="text-2xl font-bold text-white">{person.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 overflow-y-auto h-[calc(50vh-70px)]">
                    <div className="space-y-4">
                        <InfoItem label="Edad" value={person.age.toString()} />
                        <InfoItem label="Sexo" value={person.sex === 'M' ? 'Masculino' : 'Femenino'} />
                        <InfoItem label="Salario" value={`$${person.salary.toLocaleString()}/día`} color="text-red-400" />
                        {isCandidate && (
                            <InfoItem label="Tarifa de Contratación" value={`$${person.hiringFee.toLocaleString()}`} color="text-green-400" />
                        )}
                    </div>
                    <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
                        <InfoItem label="Área de Trabajo" value={specialty.name} color="text-cyan-300" />
                        <InfoItem label="Calidad de Trabajo" value={`${person.skillLevel}%`} color="text-green-400" />
                        <InfoItem label="Bonus de Habilidad" value={bonusDescription} color="text-yellow-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
    return (
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`text-lg font-semibold ${color}`}>{value}</p>
        </div>
    );
}