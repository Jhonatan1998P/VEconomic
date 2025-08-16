import React from 'react';
import { ITruck } from '../../types/game.types';
import Icon from '../../icons/Icon';

interface TruckOverviewModalProps {
  trucks: ITruck[];
  onClose: () => void;
  onSelectTruckForDetail: (truck: ITruck) => void;
}

export default function TruckOverviewModal({ trucks, onClose, onSelectTruckForDetail }: TruckOverviewModalProps) {
  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-cyan-300">Tu Flota de Camiones</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <Icon name="x-mark" className="w-8 h-8" />
          </button>
        </div>

        {trucks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tienes camiones en tu flota. ¡Compra uno para empezar!</p>
        ) : (
          <div className="space-y-4">
            {trucks.map(truck => {
              const netProfit = truck.totalRevenue - truck.totalExpenses - truck.purchaseCost;
              const statusInfo = () => {
                switch(truck.status) {
                  case 'IDLE': return { text: 'Inactivo', color: 'text-green-400', icon: 'check-circle' as const };
                  case 'DELIVERING': return { text: 'En ruta', color: 'text-yellow-400', icon: 'hourglass' as const };
                  case 'RETURNING': return { text: 'Regresando', color: 'text-blue-400', icon: 'hourglass' as const };
                }
              }
              const currentStatus = statusInfo();

              return (
                <div key={truck.id} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-gray-600 flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">{truck.name}</h3>
                    <div className={`flex items-center gap-2 text-sm font-semibold ${currentStatus.color}`}>
                      <Icon name={currentStatus.icon} className="w-5 h-5" />
                      <span>{currentStatus.text}</span>
                      {truck.status !== 'IDLE' && (
                        <span className="text-gray-400 ml-1">({truck.timeRemaining} día(s) restante)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Ingresos: <span className="text-green-400">{formatMoney(truck.totalRevenue)}</span> | 
                      Gastos: <span className="text-red-400">{formatMoney(truck.totalExpenses)}</span> | 
                      Neto: <span className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>{formatMoney(netProfit)}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => onSelectTruckForDetail(truck)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-cyan-400"
                    title="Ver detalles"
                  >
                    <Icon name="info-circle" className="w-6 h-6" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}