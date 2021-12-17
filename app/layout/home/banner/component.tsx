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
            <h5 className="text-5xl font-heading">Marxan software is</h5>
            <div className="flex flex-col w-full max-w-4xl m-auto md:px-10 md:-top-8 text-primary-500">
              {!!claimLines.length && claimLines.map((cl) => (
                <p key={cl.id}>{cl.text}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-row justify-between w-full">
            <div className="relative flex">
              <img alt="Background" src={BACKGROUND_LEGEND_IMG} className="h-40" />
              <img alt="Cheetah" src={CHEETAH_CARD_IMG} className="absolute h-24 left-10 top-24" />
              <div className="absolute bottom-0 left-0 flex">
                <img alt="Lion hexagon" src={LION_HEXAGON_IMG} className="h-24" />
                <img alt="Giraffe hexagon" src={GIRAFFE_HEXAGON_IMG} className="h-24" />
                <img alt="Cheetah hexagon" src={CHEETAH_HEXAGON_IMG} className="h-24" />
              </div>
            </div>

            <div className="relative flex space-x-3.5">
              <img alt="Map layers example" src={MAP_LAYERS_IMG} className="w-56" />
              <img alt="Scenario name label" src={SCENARIO_NAME_IMG} className="h-24 mt-3" />
              <img alt="Run scenario label" src={RUN_SCENARIO_BTN_IMG} className="absolute right-0 h-12 bottom-12" />
              <img alt="Select planning units label" src={SELECT_PLANNING_UNITS_IMG} className="absolute h-24 -left-10 -top-6" />
            </div>
            <div className="flex flex-col space-y-3.5">
              <div className="flex space-x-3.5">
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
