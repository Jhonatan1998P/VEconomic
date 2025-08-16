import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DashboardView from '../features/dashboard/DashboardView';
import BuildingsView from '../features/buildings/BuildingsView'; // Re-added import
import BuildingDetailView from '../features/buildings/BuildingDetailView';
import HRView from '../features/hr/HRView';
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
        path: 'buildings', // Re-added route for BuildingsView
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
      {
        path: 'hr',
        element: <HRView />,
      },
    ],
  },
]);