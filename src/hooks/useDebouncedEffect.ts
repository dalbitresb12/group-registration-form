import { DependencyList, EffectCallback, useCallback, useEffect } from 'react';

export const useDebouncedEffect = (effect: EffectCallback, delay = 200, deps: DependencyList = []): void => {
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const handler = setTimeout(callback, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
};
