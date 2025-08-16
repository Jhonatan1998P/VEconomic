import React from 'react';
import { ITruck } from '../../types/game.types';
import Icon from '../../icons/Icon';

interface TruckDetailModalProps {
  truck: ITruck;
  onClose: () => void;
}

export default function TruckDetailModal({ truck, onClose }: TruckDetailModalProps) {
  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  const netProfit = truck.totalRevenue - truck.totalExpenses - truck.purchaseCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-cyan-300">Detalles de {truck.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <Icon name="x-mark" className="w-8 h-8" />
          </button>
        </div>

        <div className="space-y-4 text-gray-300">
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="font-semibold">Costo de Compra:</span>
            <span className="text-red-400">{formatMoney(truck.purchaseCost)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="font-semibold">Ingresos Totales:</span>
            <span className="text-green-400">{formatMoney(truck.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="font-semibold">Gastos Totales:</span>
            <span className="text-red-400">{formatMoney(truck.totalExpenses)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="font-semibold">Beneficio Neto:</span>
            <span className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>{formatMoney(netProfit)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Trabajos Completados:</span>
            <span>{truck.jobsCompleted}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}