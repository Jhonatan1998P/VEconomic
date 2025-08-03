import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { router } from './app/Router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <RouterProvider router={router} />
    </GameProvider>
  </React.StrictMode>
);