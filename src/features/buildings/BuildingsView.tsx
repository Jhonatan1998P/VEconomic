import { useGame } from '../../hooks/useGame';
import { BUILDING_DATA } from '../../context/GameContext';
import Icon, { IconName } from '../../icons/Icon';
import { Building, BuildingType, IFactory, IWarehouse, IResearchLab, IMarketingOffice, IHumanResourcesDept, ILogisticsCenter } from '../../types/game.types';

export default function BuildingsView() {
  const { gameState, purchaseBuilding } = useGame();

  const existingBuildings = gameState.buildings.reduce((acc, b) => {
    acc[b.type] = b;
    return acc;
  }, {} as Record<BuildingType, Building>);

  const buildingTypes = Object.keys(BUILDING_DATA) as BuildingType[];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-cyan-300">Mapa Estratégico</h2>
        <p className="text-gray-400">Visualiza, construye y mejora el corazón de tu imperio. Cada decisión cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildingTypes.map(type => {
          const building = existingBuildings[type];
          const info = BUILDING_DATA[type];

          if (building) {
            return <OwnedBuildingCard key={type} building={building} />;
          } else {
            return (
              <PurchaseBuildingCard 
                key={type}
                type={type}
                info={info}
                money={gameState.money}
                onPurchase={() => purchaseBuilding(type)}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

type OwnedBuildingCardProps = {
  building: Building;
}
function OwnedBuildingCard({ building }: OwnedBuildingCardProps) {
  const info = BUILDING_DATA[building.type];

  const getBuildingDetails = () => {
    switch(building.type) {
      case 'FABRICA': return `Eficiencia: ${(building as IFactory).efficiency}%`;
      case 'ALMACEN': return `Capacidad: ${(building as IWarehouse).capacity.toLocaleString()} u.`;
      case 'LABORATORIO_ID': return `${(building as IResearchLab).researchPointsPerDay} RP/día`;
      case 'OFICINA_MARKETING': return `Alcance: ${(building as IMarketingOffice).brandAwareness}`;
      case 'DEPARTAMENTO_RRHH': return `Empleados: ?/${(building as IHumanResourcesDept).maxEmployees}`;
      case 'CENTRO_LOGISTICA': return `Reducción Costes: ${(building as ILogisticsCenter).shippingCostReduction}%`;
      default: return '';
    }
  }

  return (
    <div className="bg-gray-800 border-l-4 border-cyan-500 rounded-lg shadow-lg p-5 flex flex-col h-full">
      <div className="flex items-start gap-4">
        <Icon name={info.icon as IconName} className="w-10 h-10 text-cyan-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-white">{info.name}</h3>
          <p className="text-sm text-gray-400">Nivel {building.level}</p>
        </div>
      </div>
      <div className="mt-4 flex-grow">
        <p className="text-gray-300">{getBuildingDetails()}</p>
        <p className="text-gray-300">Mantenimiento: ${building.maintenanceCost}/día</p>
      </div>
      <button className="mt-4 w-full bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-2 rounded-md transition-colors">
        Mejorar
      </button>
    </div>
  );
}

type PurchaseBuildingCardProps = {
  type: BuildingType;
  info: { name: string; cost: number; icon: string; };
  money: number;
  onPurchase: () => void;
}
function PurchaseBuildingCard({ type, info, money, onPurchase }: PurchaseBuildingCardProps) {
  const canAfford = money >= info.cost;

  return (
    <div className="bg-gray-800/70 border border-dashed border-gray-600 rounded-lg shadow p-5 flex flex-col h-full items-center justify-center text-center">
       <Icon name={info.icon as IconName} className="w-12 h-12 text-gray-500 mb-3" />
       <h3 className="text-xl font-bold text-gray-400">{info.name}</h3>
       <p className="text-sm text-gray-500 mb-4">Parcela disponible para construcción</p>
       <button 
         onClick={onPurchase}
         disabled={!canAfford}
         className={`w-full font-semibold py-2 rounded-md transition-colors ${
           canAfford 
           ? 'bg-green-600 hover:bg-green-500 text-white' 
           : 'bg-gray-700 text-gray-500 cursor-not-allowed'
         }`}
       >
         Construir por ${info.cost.toLocaleString()}
       </button>
    </div>
  );
}