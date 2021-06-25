import { ReactNode } from 'react';

export interface BeaconProps {
  id: string;
  update: () => void;
  state: any;
}

export interface HelpContextProps {
  active: boolean;
  onActive: (active: boolean) => void;
  beacons: Record<string, BeaconProps>,
  addBeacon: (beacon: Record<string, unknown>) => void,
  removeBeacon: (beaconId: string) => void,
}

export interface HelpProviderProps {
  children: ReactNode;
}
