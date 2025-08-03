// --- START OF FILE VEconomic-main/src/index.tsx ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './context/ToastContext';
import { LoadingProvider } from './context/LoadingContext';
import { router } from './app/Router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoadingProvider>
      <ToastProvider>
        <GameProvider>
          <RouterProvider router={router} />
        </GameProvider>
      </ToastProvider>
    </LoadingProvider>
  </React.StrictMode>
);