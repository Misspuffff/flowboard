
import { useState, useCallback } from 'react';

type SetStateAction<T> = T | ((prevState: T) => T);

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

const MAX_HISTORY = 200;

export const useHistoryState = <T>(initialState: T) => {
  const [state, setHistoryState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const setState = useCallback((action: SetStateAction<T>) => {
    setHistoryState(prev => {
      const { past, present } = prev;
      const newPresent =
        typeof action === 'function'
          ? (action as (prevState: T) => T)(present)
          : action;

      // If nothing actually changed, keep the same object to avoid pointless renders
      if (newPresent === present) {
        return prev;
      }

      const nextPast = [...past, present];
      if (nextPast.length > MAX_HISTORY) {
        nextPast.shift();
      }

      return {
        past: nextPast,
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistoryState(prev => {
      const { past, present, future } = prev;
      if (past.length === 0) {
        return prev;
      }
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistoryState(prev => {
      const { past, present, future } = prev;
      if (future.length === 0) {
        return prev;
      }
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistoryState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return { state: state.present, setState, undo, redo, canUndo, canRedo, reset };
};
