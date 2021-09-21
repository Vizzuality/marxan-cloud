import React, {
  createContext, useCallback, useContext, useState,
} from 'react';

import { MultipleModalProps, MultipleModalContextProps, MultipleModalProviderProps } from './types';

const MultipleModalContext = createContext<MultipleModalContextProps>({
  modals: [],
  addMultipleModal: (modal) => { console.info(modal); },
  removeMultipleModal: (modal) => { console.info(modal); },
});

// Hook for child components to get the toast object ...
// and re-render when it changes.
export const useMultipleModal = () => {
  const ctx = useContext(MultipleModalContext);

  if (!ctx) {
    throw Error(
      'The `useMultipleModal` hook must be called from a descendent of the `MultipleModalProvider`.',
    );
  }

  return {
    modals: ctx.modals,
    addMultipleModal: ctx.addMultipleModal,
    removeMultipleModal: ctx.removeMultipleModal,
  };
};

// Provider component that wraps your app and makes toast object ...
// ... available to any child component that calls useMultipleModal().
export function MultipleModalProvider({
  children,
}: MultipleModalProviderProps) {
  const [modals, setMultipleModals] = useState<MultipleModalProps[]>([]);

  const addMultipleModal = useCallback(({ id, visible }) => {
    const newModals = [...modals];

    const currentModal = newModals.find((m) => m.id === id);

    if (!currentModal) {
      setMultipleModals([
        ...newModals.map((m) => ({ ...m, visible: false })),
        ...[{
          id,
          visible,
        }],
      ]);
    }
  }, [modals]);

  const removeMultipleModal = useCallback(({ id }) => {
    const newModals = [...modals];
    const currentModal = newModals.find((m) => m.id === id);
    const currentModalIndex = newModals.findIndex((m) => m.id === id);

    if (currentModal) {
      newModals.splice(currentModalIndex, 1);

      if (newModals[currentModalIndex - 1]) {
        newModals[currentModalIndex - 1] = {
          ...newModals[currentModalIndex - 1],
          visible: true,
        };
      }
    }
    setMultipleModals(newModals);
  }, [modals]);

  return (
    <MultipleModalContext.Provider
      value={{
        modals,
        addMultipleModal,
        removeMultipleModal,
      }}
    >
      {children}
    </MultipleModalContext.Provider>
  );
}
