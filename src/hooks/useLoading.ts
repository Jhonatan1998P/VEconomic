// --- START OF FILE VEconomic-main/src/hooks/useLoading.ts ---

import { useContext } from 'react';
import { LoadingContext } from '../context/LoadingContext';

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error('useLoading debe ser usado dentro de un LoadingProvider');
  }

  return context;
}