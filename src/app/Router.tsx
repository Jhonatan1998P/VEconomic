// --- START OF FILE VEconomic-main/src/app/Router.tsx ---

import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DashboardView from '../features/dashboard/DashboardView';
import BuildingsView from '../features/buildings/BuildingsView';
import WarehouseView from '../features/warehouse/WarehouseView';
import BuildingDetailView from '../features/buildings/BuildingDetailView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: 'buildings',
        element: <BuildingsView />,
      },
      {
        path: 'buildings/:buildingId',
        element: <BuildingDetailView />,
      },
      {
        path: 'warehouse',
        element: <WarehouseView />,
      },
    ],
  },
]);