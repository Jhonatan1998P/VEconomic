// --- START OF FILE VEconomic-main/src/features/buildings/BuildingDetailView.tsx ---

import { useParams, Navigate } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { IFactory, ILogisticsCenter } from '../../types/game.types';
import FactoryView from './FactoryView';
import LogisticsCenterView from '../logistics/LogisticsCenterView';

export default function BuildingDetailView() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const { gameState } = useGame();

  if (!buildingId) {
    return <Navigate to="/buildings" replace />;
  }

  const building = gameState.buildings.find(b => b.id === buildingId);

  if (!building) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-400">Edificio no encontrado</h2>
        <p className="text-gray-400">El edificio con ID "{buildingId}" no existe.</p>
      </div>
    );
  }

  switch (building.type) {
    case 'FABRICA':
      return <FactoryView factory={building as IFactory} />;
    case 'CENTRO_LOGISTICA':
      return <LogisticsCenterView logisticsCenter={building as ILogisticsCenter} />;
    case 'DEPARTAMENTO_RRHH':
        return (
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-cyan-400">Departamento de RR.HH.</h2>
              <p className="text-gray-400">Toda la gestión de personal se realiza en la página principal de RR.HH., accesible desde el menú de navegación.</p>
            </div>
        );
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-yellow-400">Vista no implementada</h2>
          <p className="text-gray-400">La gestión para este tipo de edificio aún no está disponible.</p>
        </div>
      );
  }
}