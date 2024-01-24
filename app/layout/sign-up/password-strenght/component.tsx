import React, { useMemo } from 'react';

import stringEntropy from 'fast-password-entropy';

import { cn } from 'utils/cn';

export interface PaasswordStrengthProps {
  password: string;
}

export const PaasswordStrength: React.FC<PaasswordStrengthProps> = ({
  password,
}: PaasswordStrengthProps) => {
  const ENTROPY = useMemo(() => {
    const e = stringEntropy(password);
    return e > 100 ? 100 : stringEntropy(password);
  }, [password]);

  const STRENGTH = useMemo(() => {
    if (ENTROPY < 50) {
      return 'weak';
    }

    if (ENTROPY < 80) {
      return 'medium';
    }
    return 'strong';
  }, [ENTROPY]);

  return (
    <div className="mt-1 h-4 space-y-0.5">
      <div className="h-1 w-full rounded-md bg-gray-200 text-sm">
        <div
          className={cn({
            'h-full rounded-md': true,
            'bg-green-600': STRENGTH === 'strong',
            'bg-yellow-800': STRENGTH === 'medium',
            'bg-red-600': STRENGTH === 'weak',
          })}
          style={{
            width: `${ENTROPY}%`,
          }}
        />
      </div>

      {!!password && (
        <div className="text-right text-xxs text-gray-600">
          Strength: <span>{STRENGTH}</span>
        </div>
      )}
    </div>
  );
};

export default PaasswordStrength;
