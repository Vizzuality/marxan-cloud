import React from 'react';

export interface StepsProps {
  step: number;
  length: number;
}

export const Steps: React.FC<StepsProps> = ({ step, length }: StepsProps) => (
  <div className="flex space-x-0.5 text-sm font-medium">
    <span className="text-white">{step}</span>
    <span className="text-gray-400">/</span>
    <span className="text-gray-400">{length}</span>
  </div>
);

export default Steps;
