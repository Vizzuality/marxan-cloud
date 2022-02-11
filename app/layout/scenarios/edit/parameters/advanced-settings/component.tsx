import React from 'react';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosAdvancedSettingsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosAdvancedSettings: React.FC<ScenariosAdvancedSettingsProps> = ({
  onChangeSection,
}: ScenariosAdvancedSettingsProps) => {
  const { query } = useRouter();
  const { sid } = query;
  console.log({ sid });
  return (
    <motion.div
      key="cost-surface"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">Advanced Settings</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-x-hidden overflow-y-auto">

        Hola
      </div>
    </motion.div>
  );
};

export default ScenariosAdvancedSettings;
