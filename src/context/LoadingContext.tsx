// --- START OF FILE VEconomic-main/src/context/LoadingContext.tsx ---

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import Icon from '../icons/Icon';

interface ILoadingContext {
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(action: () => Promise<T>) => Promise<T>;
}

export const LoadingContext = createContext<ILoadingContext>({} as ILoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(async <T>(action: () => Promise<T>): Promise<T> => {
    showLoading();
    try {
      const result = await action();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, withLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[999]">
          <Icon name="loader" className="w-16 h-16 text-cyan-400 animate-spin" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}