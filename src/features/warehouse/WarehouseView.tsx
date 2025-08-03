import { useGame } from '../../hooks/useGame';
import Icon from '../../icons/Icon';
import { IWarehouse } from '../../types/game.types';
import { ITEM_DATABASE } from '../../core/game-data/items';

export default function WarehouseView() {
  const { gameState } = useGame();

  if (!gameState || !gameState.inventory) {
    return null;
  }

  const warehouseBuildings = gameState.buildings.filter(b => b.type === 'ALMACEN') as IWarehouse[];
  const totalCapacity = warehouseBuildings.reduce((sum, wh) => sum + wh.capacity, 0);

  const currentUsage = Object.entries(gameState.inventory).reduce((sum, [itemId, amount]) => {
    const itemInfo = ITEM_DATABASE[itemId];
    if (!itemInfo) return sum;
    return sum + (itemInfo.volume * amount);
  }, 0);

  const usagePercentage = totalCapacity > 0 ? (currentUsage / totalCapacity) * 100 : 0;

  const inventoryItems = Object.entries(gameState.inventory)
    .map(([id, amount]) => {
      const itemData = ITEM_DATABASE[id];
      return itemData ? { id, amount, ...itemData } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const baseItems = inventoryItems.filter(item => item.category === 'BASE');
  const componentItems = inventoryItems.filter(item => item.category === 'COMPONENT');
  const applianceItems = inventoryItems.filter(item => item.category === 'ELECTRODOMESTICO');
  const electronicItems = inventoryItems.filter(item => item.category === 'ELECTRONICO');

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-cyan-300">Almacén Central</h2>
        <p className="text-gray-400">Aquí gestionas todos tus materias primas y productos. ¡El espacio es limitado!</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4">Capacidad Total</h3>
        <div className="relative w-full bg-gray-700 rounded-full h-8 border-2 border-gray-600">
          <div 
            className="bg-cyan-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          >
          </div>
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

      <ItemCategorySection title="Recursos Base" items={baseItems} />
      <ItemCategorySection title="Componentes" items={componentItems} />
      <ItemCategorySection title="Electrodomésticos" items={applianceItems} />
      <ItemCategorySection title="Electrónicos" items={electronicItems} />

    </div>
  );
}

type ItemCategorySectionProps = {
  title: string;
  items: (typeof ITEM_DATABASE[string] & { id: string; amount: number })[];
}
function ItemCategorySection({ title, items }: ItemCategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-200">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} name={item.name} amount={item.amount} />
        ))}
      </div>
    </div>
  );
}

type ItemCardProps = { name: string; amount: number; }
function ItemCard({ name, amount }: ItemCardProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-4 shadow">
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <Icon name="cube" className="w-8 h-8 text-cyan-400" />
      </div>
      <div className="flex-grow flex justify-between items-center">
        <span className="font-bold text-gray-300 capitalize">{name}</span>
        <span className="text-xl font-mono bg-gray-900/50 px-4 py-2 rounded">
          {amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}