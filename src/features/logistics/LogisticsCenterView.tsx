import React, { useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { NavLink } from 'react-router-dom';
import Icon from '../../icons/Icon';
import { ILogisticsCenter, ITruck, IContract } from '../../types/game.types';
import { ITEM_DATABASE } from '../../core/game-data/items';
import { TRUCK_COST } from '../../core/constants';
import { UPGRADE_DATA } from '../../core/game-data/upgrades';
import TruckOverviewModal from '../../components/modals/TruckOverviewModal';
import TruckDetailModal from '../../components/modals/TruckDetailModal';


type LogisticsCenterViewProps = {
  logisticsCenter: ILogisticsCenter;
};

export default function LogisticsCenterView({ logisticsCenter }: LogisticsCenterViewProps) {
  const { gameState, purchaseTruck, acceptContract } = useGame();
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [isDetailModal, setIsDetailModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<ITruck | null>(null);

  const canBuyTruck = gameState.trucks.length < logisticsCenter.truckSlots;

  const handleOpenOverview = () => setIsOverviewModalOpen(true);
  const handleCloseOverview = () => {
    setIsOverviewModalOpen(false);
    setSelectedTruck(null);
  };

  const handleOpenDetail = (truck: ITruck) => {
    setSelectedTruck(truck);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetail = () => setIsDetailModalOpen(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <NavLink to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors mb-4 inline-block">← Volver a Dashboard</NavLink>
        <div className="flex items-center gap-4">
          <Icon name="logistics" className="w-12 h-12 text-cyan-300" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
              Centro de Logística
            </h1>
            <p className="text-gray-400">Nivel {logisticsCenter.level} • Espacios para camiones: {gameState.trucks.length}/{logisticsCenter.truckSlots}</p>
          </div>
        </div>
      </header>

      <UpgradePanel logisticsCenter={logisticsCenter} money={gameState.money} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-200">Flota de Transporte</h2>
          <FleetSummaryCard 
            totalTrucks={gameState.trucks.length} 
            idleTrucks={gameState.trucks.filter(t => t.status === 'IDLE').length}
            onOpenOverview={handleOpenOverview}
          />
          <button 
            onClick={purchaseTruck}
            disabled={!canBuyTruck || gameState.money < TRUCK_COST}
            className="w-full font-semibold py-2 rounded-md transition-colors text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Comprar Camión por ${TRUCK_COST.toLocaleString()}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-200">Mercado de Contratos</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {gameState.contracts.filter(c => c.status === 'PENDING').map(contract => (
              <ContractCard key={contract.id} contract={contract} onAccept={() => acceptContract(contract.id)} />
            ))}
            {gameState.contracts.filter(c => c.status === 'PENDING').length === 0 && (
              <p className="text-gray-500 text-center py-8">No hay contratos disponibles. Los nuevos informes del mercado llegarán el {gameState.nextContractDate.toLocaleDateString()}.</p>
            )}
          </div>
        </div>
      </div>

      {isOverviewModalOpen && (
        <TruckOverviewModal 
          trucks={gameState.trucks} 
          onClose={handleCloseOverview} 
          onSelectTruckForDetail={handleOpenDetail} 
        />
      )}

      {isDetailModal && selectedTruck && (
        <TruckDetailModal 
          truck={selectedTruck} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
}

function UpgradePanel({ logisticsCenter, money }: { logisticsCenter: ILogisticsCenter, money: number }) {
  const { upgradeBuilding } = useGame();
  const upgradeInfo = UPGRADE_DATA[logisticsCenter.type];
  const nextLevel = logisticsCenter.level + 1;
  const nextLevelInfo = upgradeInfo.levels[nextLevel];

  if (!nextLevelInfo) {
    return (
      <section className="bg-gray-800/50 p-4 rounded-lg shadow-inner text-center">
        <h2 className="text-xl font-semibold text-green-400">Mejora Máxima Alcanzada</h2>
        <p className="text-gray-400">Este centro ya está a su máximo potencial.</p>
      </section>
    );
  }

  const canAfford = money >= nextLevelInfo.cost;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">Mejorar Edificio</h2>
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left">
          <p className="text-gray-400">Nivel Actual</p>
          <p className="text-3xl font-bold text-white">{logisticsCenter.level}</p>
          <p className="text-sm text-gray-300">Espacios de camiones: {logisticsCenter.truckSlots}</p>
          <p className="text-sm text-gray-300">Reducción de Costes: {logisticsCenter.shippingCostReduction}%</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Icon name="chevron-down" className="w-10 h-10 text-cyan-400 rotate-[-90deg] md:hidden"/>
          <Icon name="chevron-down" className="w-10 h-10 text-cyan-400 md:rotate-0 hidden md:block mb-2"/>
          <button 
            onClick={() => upgradeBuilding(logisticsCenter.id)}
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
          <p className="text-sm text-cyan-300">Espacios de camiones: {nextLevelInfo.truckSlots}</p>
          <p className="text-sm text-cyan-300">Reducción de Costes: {nextLevelInfo.shippingCostReduction}%</p>
        </div>
      </div>
    </section>
  );
}

function FleetSummaryCard({ totalTrucks, idleTrucks, onOpenOverview }: { totalTrucks: number; idleTrucks: number; onOpenOverview: () => void; }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-cyan-600 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-700 transition-colors" onClick={onOpenOverview}>
      <Icon name="logistics" className="w-10 h-10 text-cyan-400 mb-2" />
      <h4 className="text-xl font-bold text-white">Tu Flota de Camiones</h4>
      <p className="text-gray-300 mt-1">Total: {totalTrucks} camiones</p>
      <p className="text-gray-300">Disponibles: {idleTrucks} camiones</p>
      <p className="text-sm text-cyan-400 mt-2">Haz clic para ver detalles</p>
    </div>
  );
}

function ContractCard({ contract, onAccept }: { contract: IContract, onAccept: () => void }) {
  const { gameState } = useGame();
  const item = ITEM_DATABASE[contract.itemId];
  const isSell = contract.type === 'SELL';
  const hasEnoughItems = isSell ? (gameState.inventory[contract.itemId] || 0) >= contract.quantity : true;
  const hasEnoughMoney = !isSell ? gameState.money >= -contract.reward : true;
  const hasIdleTruck = gameState.trucks.some(t => t.status === 'IDLE');
  const canAccept = hasEnoughItems && hasEnoughMoney && hasIdleTruck;

  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 ${isSell ? 'border-green-500' : 'border-blue-500'}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <h4 className="text-xl font-bold text-white">{isSell ? 'Vender' : 'Comprar'}: {item.name}</h4>
          <p className="text-gray-400">Cantidad: {contract.quantity.toLocaleString()} unidades</p>
          <p className="text-gray-400">Duración del viaje: {contract.travelTime} día(s)</p>
          <p className="text-gray-400 text-sm mt-1">Expira: {contract.expirationDate.toLocaleDateString()}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-2xl font-bold ${isSell ? 'text-green-400' : 'text-red-400'}`}>
            {isSell ? `+` : ''}${contract.reward.toLocaleString()}$
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
        <button
          onClick={onAccept}
          disabled={!canAccept}
          className="px-6 py-2 rounded-md font-semibold text-white transition-colors bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Aceptar Contrato
        </button>
      </div>
    </div>
  );
}