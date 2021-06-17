import React from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import Button from 'components/button';

// Icons
import ARROW_LEFT_SVG from 'svgs/ui/arrow-left-3.svg?sprite';
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-3.svg?sprite';
import INFO_SVG from 'svgs/ui/info-2.svg?sprite';

import { ScenariosSolutionsGapAnalysisProps } from './types';

export const ScenariosSolutionsGapAnalysis: React.FC<ScenariosSolutionsGapAnalysisProps> = ({
  onChangeSection,
}: ScenariosSolutionsGapAnalysisProps) => {
  return (
    <motion.div
      key="details"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header>
        <button
          type="button"
          className="flex items-center w-full pt-5 pb-1 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_RIGHT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">GAP ANALYSIS</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <div
          className="flex items-center"
        >
          <h5 className="mr-2 text-xs uppercase">RUN GAP ANALYSIS</h5>
          <button
            type="button"
            className="mr-4 opacity-50"
            onClick={() => console.info('Info - Gap Analysis')}
          >
            <Icon icon={INFO_SVG} className="w-5 h-5" />
          </button>
          <Button
            theme="secondary"
            size="xs"
            onClick={() => console.info('Download - Gap Analysis')}
          >
            Download
          </Button>
        </div>
        <Button
          theme="primary-alt"
          size="base"
          className="relative h-12 mt-4"
          onClick={() => console.info('View run gap analysis')}
        >
          View run gap analysis
          <div className="absolute right-12">
            <div className="relative">
              <Icon icon={ARROW_LEFT_SVG} className="absolute bottom-0 w-4 h-4" />
              <Icon icon={ARROW_RIGHT_SVG} className="absolute top-0 w-4 h-4" />
            </div>
          </div>
        </Button>
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsGapAnalysis;
