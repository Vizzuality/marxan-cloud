import {
  useMemo,
} from 'react';

export function useFeatureFlags(): Record<string, boolean> {
  const flags = useMemo(() => {
    const FLAGS = (process.env.NEXT_PUBLIC_FEATURE_FLAGS || '').split(',');

    return FLAGS.reduce((acc, flag) => {
      return {
        ...acc,
        [flag]: true,
      };
    }, {});
  }, []);

  return flags;
}
