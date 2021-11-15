import React, { useState } from 'react';

import { motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Modal from 'components/modal';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosBLMCalibrationProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosBLMCalibration: React.FC<ScenariosBLMCalibrationProps> = ({
  onChangeSection,
}: ScenariosBLMCalibrationProps) => {
  const [blmModal, setBlmModal] = useState(false);
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
          <h4 className="text-xs uppercase font-heading text-primary-500">CALIBRATE BLM</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">Calibrate BLM</h4>
            <div className="space-y-2" />

          </div>
        </InfoButton>

      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 pt-2 mt-1 space-y-5 overflow-hidden text-sm">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          In a iaculis nulla. Duis aliquam lacus massa, id sollicitudin massa.
        </p>
        <p>
          Select the BLM range and calibrate.
        </p>
        <Button
          theme="primary-alt"
          size="base"
          className="w-full"
          onClick={() => setBlmModal(true)}
        >
          Calibrate BLM
        </Button>
        <Modal
          title="BLM"
          open={blmModal}
          size="wide"
          onDismiss={() => setBlmModal(false)}
        >
          {/* <Calibrate /> */}
        </Modal>
      </div>
    </motion.div>
  );
};

export default ScenariosBLMCalibration;
