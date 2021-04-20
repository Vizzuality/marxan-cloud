import React, { useState } from 'react';

import { motion } from 'framer-motion';

import Pill from 'layout/pill';
import AddFeatures from 'layout/scenarios/sidebar/features/add';
import ListFeatures from 'layout/scenarios/sidebar/features/list';
import TargetFeatures from 'layout/scenarios/sidebar/features/targets';

import Steps from 'components/steps';
import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';
import { useSelectedFeatures } from 'hooks/features';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import FEATURES_SVG from 'svgs/ui/features.svg?sprite';

export interface ScenariosSidebarWDPAProps {
}

export const ScenariosSidebarWDPA: React.FC<ScenariosSidebarWDPAProps> = () => {
  const [step, setStep] = useState(0);
  const [modal, setModal] = useState(false);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures({});

  if (!scenarioData || tab !== 'features') return null;

  return (
    <motion.div
      key="features"
      className="flex flex-col min-h-0 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Pill selected>
        <header className="flex justify-between flex-shrink-0">
          <div>
            <div className="flex items-baseline space-x-4">
              <h2 className="text-lg font-medium font-heading">Features</h2>
              <Steps step={step + 1} length={2} />
            </div>

            <div className="flex items-center mt-2 space-x-2">

              {step === 0 && (
                <>
                  <Icon icon={FEATURES_SVG} className="w-4 h-4 text-gray-400" />
                  <div className="text-xs uppercase font-heading">
                    Features added:
                    {' '}
                    {selectedFeaturesData && <span className="ml-1 text-gray-400">{selectedFeaturesData.length}</span>}
                  </div>
                </>
              )}

              {step === 1 && (
                <div className="text-xs uppercase font-heading">
                  Set the minimum targets amount you want to achieve for your features.
                </div>
              )}
            </div>
          </div>

          {step === 0 && (
            <Button
              theme="primary"
              size="lg"
              onClick={() => setModal(true)}
            >
              <span className="mr-3">Add features</span>
              <Icon icon={PLUS_SVG} className="w-4 h-4" />
            </Button>
          )}
        </header>

        <Modal
          title="Hello"
          open={modal}
          size="narrow"
          className="h-full"
          onDismiss={() => setModal(false)}
        >
          <AddFeatures />
        </Modal>

        {step === 0 && (
          <ListFeatures
            onSuccess={() => setStep(step + 1)}
          />
        )}

        {step === 1 && (
          <TargetFeatures
            onBack={() => setStep(step - 1)}
            onSuccess={() => dispatch(setTab('analysis'))}
          />
        )}
      </Pill>
    </motion.div>
  );
};

export default ScenariosSidebarWDPA;
