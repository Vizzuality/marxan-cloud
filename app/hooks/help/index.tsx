import React, {
  createContext, useCallback, useContext, useState,
} from 'react';

import { BeaconProps, HelpContextProps, HelpProviderProps } from './types';

const HelpContext = createContext<HelpContextProps>({
  active: false,
  onActive: (active) => { console.info(active); },
  beacons: {},
  addBeacon: (beacon) => { console.info(beacon); },
  removeBeacon: (beacon) => { console.info(beacon); },
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
    beacons: ctx.beacons,
    addBeacon: ctx.addBeacon,
    removeBeacon: ctx.removeBeacon,
  };
};

// Provider component that wraps your app and makes toast object ...
// ... available to any child component that calls useHelp().
export function HelpProvider({
  children,
}: HelpProviderProps) {
  const [active, setActive] = useState(false);
  const [beacons, setBeacons] = useState<Record<string, BeaconProps>>({});

  const onActive = useCallback((a: boolean) => {
    return setActive(a);
  }, [setActive]);

  const addBeacon = useCallback(({ id, state, update }) => {
    setBeacons((prevBeacons) => {
      return {
        ...prevBeacons,
        [id]: {
          id,
          state,
          update,
        },
      };
    });
  }, []);

  const removeBeacon = useCallback((id: string) => {
    const { [id]: omitted, ...rest } = beacons;
    setBeacons(rest);
  }, [beacons]);

  return (
    <HelpContext.Provider
      value={{
        active,
        onActive,
        beacons,
        addBeacon,
        removeBeacon,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}
