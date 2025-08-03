import { useGame } from '../../hooks/useGame';
import Icon, { IconName } from '../../icons/Icon';

export default function DashboardView() {
  const { gameState, advanceDay } = useGame();

  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const totalMaintenanceCost = gameState.buildings.reduce((sum, building) => sum + building.maintenanceCost, 0);
  const dailyCosts = 150 + totalMaintenanceCost;
  const dailyIncome = 500;
  const netIncome = dailyIncome - dailyCosts;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-cyan-300">
          Resumen Ejecutivo
        </h2>
        <p className="text-gray-400">
          Bienvenido, {gameState.playerName}. Este es el pulso de tu imperio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Valor de la Empresa"
          value={formatMoney(gameState.companyValue)}
          icon="chart-bar"
          color="text-green-400"
        />
        <KpiCard
          title="Edificios Construidos"
          value={gameState.buildings.length.toString()}
          icon="factory"
          color="text-blue-400"
        />
        <KpiCard
          title="Costes Diarios"
          value={formatMoney(dailyCosts)}
          icon="money"
          color="text-red-400"
        />
         <KpiCard
          title="Beneficio Neto Diario"
          value={formatMoney(netIncome)}
          icon={netIncome >= 0 ? 'chart-bar' : 'money'}
          color={netIncome >= 0 ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Icon name="newspaper" className="w-6 h-6 text-gray-300" />
            <span>Registro de Eventos</span>
          </h3>
          <ul className="space-y-2 h-48 overflow-y-auto pr-2">
            {gameState.events.map((event, index) => (
              <li key={index} className="text-sm text-gray-300 border-b border-gray-700 pb-1">
                {event}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
           <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
           <button
             onClick={advanceDay}
             className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-3"
           >
             <Icon name="calendar" className="w-6 h-6" />
             <span>Avanzar un día</span>
           </button>
        </div>
      </div>
    </div>
  );
}

type KpiCardProps = { title: string; value: string; icon: IconName; color: string; };
function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
      <div className={`bg-gray-700/50 p-3 rounded-lg ${color}`}>
        <Icon name={icon} className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}