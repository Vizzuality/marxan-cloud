/**
 * This hook is an implementation of Dan Abramov's blog post
 * "Making setInterval Declarative with React Hooks".
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */

import { useEffect, useRef } from 'react';

export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(
    () => {
      savedCallback.current = callback;
    },
    [callback],
  );

  useEffect(
    () => {
      const handler = (...args) => savedCallback.current(...args);

      if (delay !== null) {
        const id = setInterval(handler, delay);
        return () => clearInterval(id);
      }

      return undefined;
    },
    [delay],
  );
};
