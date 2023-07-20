import React, { ReactNode } from 'react';

export interface ScenarioSettingsProps {
  children: ReactNode;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDuplicate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const ScenarioSettings: React.FC<ScenarioSettingsProps> = ({
  children,
}: ScenarioSettingsProps) => {
  return <div className="w-full rounded-b-3xl bg-gray-700 px-8 pb-4 pt-6">{children}</div>;
};

export default ScenarioSettings;
