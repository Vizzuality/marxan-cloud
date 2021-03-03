import { ToastItemProps } from 'hooks/toast/types';

export interface ToastProps extends ToastItemProps {
}

export interface ToastTheme {
  info: ToastThemeOption;
  success: ToastThemeOption;
  warning: ToastThemeOption;
  error: ToastThemeOption;
}

export interface ToastThemeOption {
  icon: any;
  bg: string;
  hoverBg: string;
}
