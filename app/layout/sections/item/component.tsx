import React, { useState } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSidebarAnalysisSectionProps {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSection: React.FC<ScenariosSidebarAnalysisSectionProps> = ({
  id,
  name,
  description,
  disabled,
  onChangeSection,
}: ScenariosSidebarAnalysisSectionProps) => {
  const [animate, setAnimate] = useState('leave');

  return (
    <button
      aria-label="change-section"
      type="button"
      className="relative w-full py-5 pr-20 text-left focus:outline-none"
      disabled={disabled}
      onMouseEnter={() => setAnimate('enter')}
      onMouseLeave={() => setAnimate('leave')}
      onClick={() => onChangeSection(id)}
    >
      <h4
        className={cn({
          'font-heading text-xs uppercase': true,
          'opacity-30': disabled,
        })}
      >
        {name}
      </h4>
      <p
        className={cn({
          'mt-1 text-sm text-gray-400': true,
          'opacity-30': disabled,
        })}
      >
        {description}
      </p>

      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 transform"
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
        <Icon
          icon={ARROW_RIGHT_2_SVG}
          className={cn({
            'h-5 w-5 text-primary-500': true,
            'opacity-75': !disabled,
            'opacity-30': disabled,
          })}
        />
      </motion.div>
    </button>
  );
};

export default ScenariosSidebarAnalysisSection;
