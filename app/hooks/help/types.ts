import { ReactNode } from 'react';

export interface HelpContextProps {
  active: boolean;
  onActive: (active: boolean) => void;
}

export interface HelpProviderProps {
  children: ReactNode;
}
