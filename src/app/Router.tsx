import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DashboardView from '../features/dashboard/DashboardView';
import BuildingsView from '../features/buildings/BuildingsView';
import WarehouseView from '../features/warehouse/WarehouseView';

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
        path: 'warehouse',
        element: <WarehouseView />,
      },
    ],
  },
]);