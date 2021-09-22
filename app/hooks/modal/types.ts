import { ReactNode } from 'react';

export interface MultipleModalProps {
  id: string;
  visible?: any;
}

export interface MultipleModalContextProps {
  modals: MultipleModalProps[],
  addMultipleModal: (modal: MultipleModalProps) => void;
  removeMultipleModal: (modal: MultipleModalProps) => void;
}

export interface MultipleModalProviderProps {
  children: ReactNode;
}
