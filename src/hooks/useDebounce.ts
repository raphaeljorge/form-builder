import { useCallback, useEffect, useRef } from 'react';
import type { DebounceConfig } from '../types/form';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  config?: DebounceConfig
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastValueRef = useRef<any>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      // Store the latest value immediately
      lastValueRef.current = args[0];

      if (!config?.enabled) {
        callbackRef.current(...args);
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Use the latest value when the timeout fires
        callbackRef.current(lastValueRef.current);
      }, config?.delay || 300);
    },
    [config?.enabled, config?.delay]
  );
}
