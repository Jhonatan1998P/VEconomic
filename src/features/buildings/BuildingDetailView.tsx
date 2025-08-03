// --- START OF FILE VEconomic-main/src/features/buildings/BuildingDetailView.tsx ---

import { useParams, Navigate } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { IFactory } from '../../types/game.types';
import FactoryView from './FactoryView';

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
    // case 'ALMACEN':
    //   return <WarehouseDetailView warehouse={building as IWarehouse} />;
    // ... otros tipos de edificios
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-yellow-400">Vista no implementada</h2>
          <p className="text-gray-400">La gestión para este tipo de edificio aún no está disponible.</p>
        </div>
      );
  }
}