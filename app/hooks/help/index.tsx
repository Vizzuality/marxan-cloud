import React, {
  createContext, useCallback, useContext, useState,
} from 'react';
import { HelpContextProps, HelpProviderProps } from './types';

const HelpContext = createContext<HelpContextProps>({
  active: false,
  onActive: (active) => { console.info(active); },
});

// Hook for child components to get the toast object ...
// and re-render when it changes.
export const useHelp = () => {
  const ctx = useContext(HelpContext);

  if (!ctx) {
    throw Error(
      'The `useHelp` hook must be called from a descendent of the `HelpProvider`.',
    );
  }

  return {
    active: ctx.active,
    onActive: ctx.onActive,
  };
};

// Provider component that wraps your app and makes toast object ...
// ... available to any child component that calls useHelp().
export function HelpProvider({
  children,
}: HelpProviderProps) {
  const [active, setActive] = useState(false);

  const onActive = useCallback((a: boolean) => {
    return setActive(a);
  }, [setActive]);

  return (
    <HelpContext.Provider
      value={{
        active,
        onActive,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}
