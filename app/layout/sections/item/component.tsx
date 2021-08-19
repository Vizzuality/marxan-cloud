import React, { useState } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSidebarAnalysisSectionProps {
  id: string;
  name: string;
  description: string;
  readonly?: boolean,
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSection: React.FC<ScenariosSidebarAnalysisSectionProps> = ({
  id,
  name,
  description,
  readonly,
  onChangeSection,
}: ScenariosSidebarAnalysisSectionProps) => {
  const [animate, setAnimate] = useState('leave');

  return (
    !readonly && (

    <button
      type="button"
      className="relative w-full py-5 pr-20 text-left focus:outline-none"
      onMouseEnter={() => setAnimate('enter')}
      onMouseLeave={() => setAnimate('leave')}
      onClick={() => onChangeSection(id)}
    >
      <h4 className="text-xs uppercase font-heading">{name}</h4>
      <p className="mt-1 text-sm text-gray-300">{description}</p>

      <motion.div
        className="absolute transform -translate-y-1/2 right-4 top-1/2"
        initial={{
          opacity: 1,
          x: 0,
          y: '-50%',
        }}
        animate={animate}
        variants={{
          enter: {
            opacity: 1,
            x: 5,
            y: '-50%',
            transition: {
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'mirror',
              duration: 0.4,
            },
          },
          leave: {
            opacity: 1,
            x: 0,
            y: '-50%',
            transition: {
              ease: 'easeInOut',
            },
          },
        }}
      >
        <Icon icon={ARROW_RIGHT_2_SVG} className="w-5 h-5 opacity-75 text-primary-500" />
      </motion.div>
    </button>
    )
  );
};

export default ScenariosSidebarAnalysisSection;
