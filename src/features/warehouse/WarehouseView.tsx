// --- START OF FILE VEconomic-main/src/features/warehouse/WarehouseView.tsx ---

import React, { useState, useMemo } from 'react';
import { useGame } from '../../hooks/useGame';
import Icon from '../../icons/Icon';
import { IWarehouse, ItemId } from '../../types/game.types';
import { ITEM_DATABASE } from '../../core/game-data/items';

export default function WarehouseView() {
  const { gameState } = useGame();
  const [searchTerm, setSearchTerm] = useState('');

  const warehouseBuildings = gameState.buildings.filter(b => b.type === 'ALMACEN') as IWarehouse[];
  const totalCapacity = warehouseBuildings.reduce((sum, wh) => sum + wh.capacity, 0);

  const currentUsage = useMemo(() => Object.entries(gameState.inventory).reduce((sum, [itemId, amount]) => {
    const itemInfo = ITEM_DATABASE[itemId as ItemId];
    if (!itemInfo) return sum;
    return sum + (itemInfo.volume * amount);
  }, 0), [gameState.inventory]);

  const usagePercentage = totalCapacity > 0 ? (currentUsage / totalCapacity) * 100 : 0;

  const filteredInventoryItems = useMemo(() => Object.entries(gameState.inventory)
    .map(([id, amount]) => {
      const itemData = ITEM_DATABASE[id as ItemId];
      return itemData ? { id: id as ItemId, amount, ...itemData } : null;
    })
    .filter((item): item is NonNullable<typeof item> => 
        item !== null && 
        item.amount > 0 &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name)), [gameState.inventory, searchTerm]);

  const baseItems = filteredInventoryItems.filter(item => item.category === 'BASE');
  const componentItems = filteredInventoryItems.filter(item => item.category === 'COMPONENT');
  const applianceItems = filteredInventoryItems.filter(item => item.category === 'ELECTRODOMESTICO');
  const electronicItems = filteredInventoryItems.filter(item => item.category === 'ELECTRONICO');

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-cyan-300">Almacén Central</h2>
        <p className="text-gray-400">Aquí gestionas todos tus materias primas y productos. ¡El espacio es limitado!</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Capacidad Total</h3>
          <div className="relative w-full bg-gray-700 rounded-full h-8 border-2 border-gray-600">
            <div 
              className="bg-cyan-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-md">
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between text-gray-300 mt-2">
            <span>Usado: {currentUsage.toLocaleString()} m³</span>
            <span>Total: {totalCapacity.toLocaleString()} m³</span>
          </div>
          {totalCapacity === 0 && (
            <p className="text-center text-yellow-400 mt-4">¡No tienes ningún almacén! Construye uno para empezar a guardar recursos.</p>
          )}
        </div>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="search" className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ítem por nombre..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
        </div>
      </div>

      {filteredInventoryItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg">
            <Icon name="search" className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-gray-400">No se encontraron ítems</h3>
            <p className="text-gray-500">Prueba a cambiar el término de búsqueda o produce nuevos artículos.</p>
        </div>
      ) : (
        <>
          <ItemCategorySection title="Recursos Base" items={baseItems} />
          <ItemCategorySection title="Componentes" items={componentItems} />
          <ItemCategorySection title="Electrodomésticos" items={applianceItems} />
          <ItemCategorySection title="Electrónicos" items={electronicItems} />
        </>
      )}
    </div>
  );
}

type ItemCategorySectionProps = {
  title: string;
  items: (typeof ITEM_DATABASE[string] & { id: ItemId; amount: number })[];
}
function ItemCategorySection({ title, items }: ItemCategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-200">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

type ItemCardProps = {
  item: (typeof ITEM_DATABASE[string] & { id: ItemId; amount: number });
}
function ItemCard({ item }: ItemCardProps) {
    const { sellItem } = useGame();
    const [quantity, setQuantity] = useState<number | string>(1);
    const isSellable = item.category !== 'BASE';

    const numQuantity = Number(quantity);
    const sellValue = numQuantity * item.baseSellPrice;

    const handleSell = () => {
        if (isSellable && numQuantity > 0 && numQuantity <= item.amount) {
            sellItem(item.id, numQuantity);
            setQuantity(1);
        }
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            const parsedValue = value === '' ? '' : parseInt(value, 10);
            if (parsedValue === '' || parsedValue <= item.amount) {
              setQuantity(parsedValue);
            } else {
              setQuantity(item.amount);
            }
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col transition-all duration-300">
            <div className="p-4 flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-cyan-300 capitalize">{item.name}</h4>
                    <p className="text-sm text-gray-400">En stock: {item.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Precio de venta: ${item.baseSellPrice}/u</p>
                </div>
                <Icon name="cube" className="w-10 h-10 text-gray-600" />
            </div>

            {isSellable ? (
                <div className="p-4 bg-gray-900/50 mt-auto space-y-3">
                    <div className="flex gap-2">
                        <input 
                            type="number"
                            min="1"
                            max={item.amount}
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            placeholder='Cant.'
                        />
                        <button 
                            onClick={handleSell}
                            disabled={numQuantity <= 0 || numQuantity > item.amount}
                            className="w-full px-4 py-2 rounded-md font-semibold text-white transition-colors bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Vender
                        </button>
                    </div>
                    <div className="text-center text-gray-300 text-sm">
                        <span>Valor de venta: </span>
                        <span className="font-bold text-green-400">${sellValue.toLocaleString()}</span>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-gray-900/50 mt-auto text-center">
                    <p className="text-sm text-gray-500 italic">Este recurso no se puede vender directamente.</p>
                </div>
            )}
        </div>
    );
}