import React, {
  createContext, useCallback, useContext, useState,
} from 'react';

import { AnimatePresence } from 'framer-motion';

import ToastContainer from 'layout/toast';

import Toast from 'components/toast';

import {
  ToastItemProps, ToastContextProps, ToastProviderProps, ToastContent, ToastItemOptionsProps,
} from './types';

export function generateUEID() {
  let first = `${(Math.random() * 46656)}`;
  let second = `${(Math.random() * 46656)}`;
  first = (`000${first.toString()}`).slice(-3);
  second = (`000${second.toString()}`).slice(-3);
  return first + second;
}

const ToastContext = createContext<ToastContextProps>({
  add: (id, content, options) => { console.info(id, content, options); },
  remove: (id) => { console.info(id); },
  toasts: [],
});

// Hook for child components to get the toast object ...
// and re-render when it changes.
export const useToasts = () => {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw Error(
      'The `useToasts` hook must be called from a descendent of the `ToastProvider`.',
    );
  }

  return {
    addToast: ctx.add,
    removeToast: ctx.remove,
    toasts: ctx.toasts,
  };
};

// Provider component that wraps your app and makes toast object ...
// ... available to any child component that calls useToast().
export function ToastProvider({
  children,
  placement,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItemProps[]>([]);

  const add = useCallback((id: string, content: ToastContent, options: ToastItemOptionsProps) => {
    if (toasts.find((t) => t.id === id)) {
      return false;
    }

    const newToast = {
      id: id || generateUEID(),
      content,
      ...options,
    };

    return setToasts([
      ...toasts,
      newToast,
    ]);
  }, [toasts, setToasts]);

  const remove = useCallback((id) => {
    return setToasts(toasts.filter((t) => t.id !== id));
  }, [toasts, setToasts]);

  return (
    <ToastContext.Provider
      value={{
        add,
        remove,
        toasts,
      }}
    >
      {children}

      {/* Container */}
      <ToastContainer placement={placement}>
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <Toast
              key={`${t.id}`}
              {...t}
              onDismiss={remove}
            />
          ))}
        </AnimatePresence>
      </ToastContainer>
    </ToastContext.Provider>
  );
}
