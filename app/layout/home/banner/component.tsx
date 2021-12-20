import React from 'react';

import Wrapper from 'layout/wrapper';

import BACKGROUND_LEGEND_IMG from 'images/home-banner/background-legend.png';
import CHEETAH_CARD_IMG from 'images/home-banner/cheetah-card.png';
import CHEETAH_HEXAGON_IMG from 'images/home-banner/cheetah-hexagon.png';
import GIRAFFE_HEXAGON_IMG from 'images/home-banner/giraffe-hexagon.png';
import LION_HEXAGON_IMG from 'images/home-banner/lion-hexagon.png';
import MAP_LAYERS_IMG from 'images/home-banner/map-layers.png';
import RUN_SCENARIO_BTN_IMG from 'images/home-banner/run-scenario-btn.png';
import SCENARIO_NAME_IMG from 'images/home-banner/scenario-name.png';
import SCHEDULE_SCENARIO_IMG from 'images/home-banner/schedule-scenario.png';
import SELECT_PLANNING_UNITS_IMG from 'images/home-banner/select-planning-units.png';
import SELECTION_FREQUENCY_IMG from 'images/home-banner/selection-frequency.png';
import SOLUTION_DISTRIBUTION_IMG from 'images/home-banner/solution-distribution.png';

export interface HomeBannerProps {

}

const claimLines = [{ id: '0', text: 'free and open' }, { id: '1', text: 'flexible' }, { id: '2', text: 'efficient & repitable' }];

export const HomeBanner: React.FC<HomeBannerProps> = () => {
  return (
    <div className="py-32 bg-gray-500" style={{ background: 'radial-gradient(circle at 50% 60%, rgba(54,55,62,1) 0%, rgba(17,17,17,1) 51%)' }}>

      <Wrapper>
        <div className="flex flex-col items-center space-y-20">
          <div>
            <h5 className="text-6xl leading-10 font-heading">Marxan software is</h5>
            <div
              className="relative h-40"
              style={{ clipPath: 'polygon(0 5%, 100% 5%, 100% 45%, 0 45%)' }}
            >
              <div className="absolute flex flex-col items-center w-full max-w-4xl animate-banner text-primary-500">
                {!!claimLines.length && claimLines.map((cl) => (
                  <p className="mb-16 text-5xl" key={cl.id}>{cl.text}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-row justify-between w-full">

            <div className="flex w-1/3 pl-28">
              <img
                alt="Background"
                src={BACKGROUND_LEGEND_IMG}
                className="absolute h-40 opacity-30 bottom-20 -top-28 -left-10"
              />
              <img alt="Cheetah" src={CHEETAH_CARD_IMG} className="absolute z-10 h-36 -top-6 left-16" />
              <div className="relative flex w-80">
                <img alt="Lion hexagon" src={LION_HEXAGON_IMG} className="absolute h-26 bottom-12" />
                <img alt="Giraffe hexagon" src={GIRAFFE_HEXAGON_IMG} className="absolute bottom-0 h-26 right-26" />
                <img alt="Cheetah hexagon" src={CHEETAH_HEXAGON_IMG} className="absolute right-0 z-40 h-26 bottom-12" />
              </div>
            </div>

            <div className="relative flex flex-row space-x-3.5 w-1/3">

              <img alt="Map layers example" src={MAP_LAYERS_IMG} className="self-center w-56 pr-2 mx-auto" />

              <img alt="Scenario name label" src={SCENARIO_NAME_IMG} className="absolute h-24 top-3 right-5" />
              <img alt="Run scenario label" src={RUN_SCENARIO_BTN_IMG} className="absolute h-12 right-5 bottom-16" />
              <img alt="Select planning units label" src={SELECT_PLANNING_UNITS_IMG} className="absolute h-24 left-12 -top-6" />
            </div>
            <div className="absolute w-full h-8 -bottom-16">
              <div
                className="top-0 w-56 h-full mx-auto opacity-30"
                style={{ background: 'radial-gradient(130px 15px at center, #000000, transparent)' }}
              />
            </div>
            <div className="flex flex-col w-1/3 mx-auto space-y-6">
              <div className="flex mt-3 space-x-3.5">
                <img alt="Solution distribution legend" src={SOLUTION_DISTRIBUTION_IMG} className="h-24" />
                <img alt="Schedule scenario label example" src={SCHEDULE_SCENARIO_IMG} className="h-24" />
              </div>
              <img alt="Selection frequency legend" src={SELECTION_FREQUENCY_IMG} className="h-28" />
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeBanner;
