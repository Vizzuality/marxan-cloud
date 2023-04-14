import { ReactNode } from 'react';

export type ToastContent = ReactNode | string;

export interface ToastItemOptionsProps {
  level: Level;
  autoDismiss?: boolean;
  onDismiss?: (id: string) => void;
}

export interface ToastItemProps extends ToastItemOptionsProps {
  id: string;
  content: ToastContent;
}

export interface ToastContainerProps {
  children: ReactNode;
  placement: Placement;
}

export interface ToastContextProps {
  add: (id: string, content: ToastContent, options: ToastItemOptionsProps) => void;
  remove: (id: string) => void;
  toasts: ToastItemProps[];
}

export interface ToastProviderProps {
  children: ReactNode;
  placement: Placement;
  defaultAutoDismiss: boolean;
  defaultAutoDismissTime: number; // milliseconds
}

export type Placement =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type Level = 'info' | 'success' | 'warning' | 'error';
