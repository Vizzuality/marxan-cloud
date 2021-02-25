import React, {
  createContext, useContext, useState,
} from 'react';

import Toast from 'components/toast';
import ToastContainer from 'layout/toast';

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
  add: (id, content, options) => { console.info(content, options); },
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

  const add = (id: string, content: ToastContent, options: ToastItemOptionsProps) => {
    const newToast = {
      id: id || generateUEID(),
      content,
      ...options,
    };

    setToasts([
      ...toasts,
      newToast,
    ]);
  };

  return (
    <ToastContext.Provider
      value={{
        add,
        toasts,
      }}
    >
      {children}

      {/* Container */}
      <ToastContainer placement={placement} hasToasts={!!toasts.length}>
        <div className="flex flex-col gap-2">
          {toasts.map((t: ToastItemProps) => (
            <Toast key={`${t.id}`} {...t}>
              {t.content}
            </Toast>
          ))}
        </div>
      </ToastContainer>
    </ToastContext.Provider>
  );
}
