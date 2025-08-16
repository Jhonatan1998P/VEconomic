import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigation } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import Icon from '../icons/Icon';
import { BuildingType } from '../types/game.types'; // Importación correcta del tipo

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { gameState } = useGame();
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  const day = Math.floor((gameState.date.getTime() - new Date(2025, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 text-lg ${
      isActive ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
    }`;

  // Acceder a los tipos de edificio como literales de cadena, no como propiedades de un tipo
  const firstFactory = gameState.buildings.find(b => b.type === 'FABRICA');
  const firstLogisticsCenter = gameState.buildings.find(b => b.type === 'CENTRO_LOGISTICA');

  return (
    <div className="bg-gray-900 text-white min-h-screen flex">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <nav 
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 flex flex-col shadow-lg z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 mb-10 px-2 flex-shrink-0">
          <Icon name="factory" className="w-10 h-10 text-cyan-400 flex-shrink-0" />
          <h1 className="text-2xl font-bold text-gray-100">Virtual<span className="text-cyan-400">Economic</span></h1>
        </div>
        <ul className="space-y-2 flex-grow">
          <li><NavLink to="/" className={navLinkStyle} onClick={() => setIsSidebarOpen(false)}><Icon name="dashboard" className="w-6 h-6"/><span>Dashboard</span></NavLink></li>
          {firstFactory && (
            <li><NavLink to={`/buildings/${firstFactory.id}`} className={navLinkStyle} onClick={() => setIsSidebarOpen(false)}><Icon name="factory" className="w-6 h-6"/><span>Fábrica</span></NavLink></li>
          )}
          {firstLogisticsCenter && (
            <li><NavLink to={`/buildings/${firstLogisticsCenter.id}`} className={navLinkStyle} onClick={() => setIsSidebarOpen(false)}><Icon name="logistics" className="w-6 h-6"/><span>Logística</span></NavLink></li>
          )}
          <li><NavLink to="/warehouse" className={navLinkStyle} onClick={() => setIsSidebarOpen(false)}><Icon name="warehouse" className="w-6 h-6"/><span>Almacén</span></NavLink></li>
          <li><NavLink to="/hr" className={navLinkStyle} onClick={() => setIsSidebarOpen(false)}><Icon name="hr" className="w-6 h-6"/><span>RR.HH.</span></NavLink></li>
        </ul>
        <div className="mt-auto text-center text-xs text-gray-500 flex-shrink-0">
          <p>Jugador: {gameState.playerName}</p>
          <p>© 2025</p>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-md flex justify-between items-center">
          <button 
            className="text-gray-300 hover:text-white md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Icon name="menu" className="w-8 h-8"/>
          </button>
          <div className="flex-grow flex justify-end items-center">
            <div className="flex items-center space-x-4 md:space-x-6 text-base md:text-lg">
              <div className="flex items-center gap-2">
                <Icon name="money" className="w-6 h-6 text-green-400" />
                <span className="font-semibold text-green-400">{formatMoney(gameState.money)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="calendar" className="w-6 h-6 text-blue-300" />
                <span className="font-semibold text-blue-300"><span className="hidden sm:inline">Día:</span> {day}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-grow p-4 sm:p-6 overflow-y-auto transition-opacity duration-300 ${isNavigating ? 'opacity-25' : 'opacity-100'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}