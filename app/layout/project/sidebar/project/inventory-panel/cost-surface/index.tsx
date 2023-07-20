import Image from 'next/image';

import InfoButton from 'components/info-button/component';

import COST_LAND_IMG from 'images/info-buttons/img_cost_surface_marine.png';
import COST_SEA_IMG from 'images/info-buttons/img_cost_surface_terrestrial.png';

const InventoryPanelCostSurface = (): JSX.Element => {
  return (
    <div className="flex items-start justify-between rounded-xl bg-gray-700 p-6">
      <div className="flex w-full items-start justify-between">
        <div>
          <h3 className="font-sans text-xs font-semibold text-blue-500">Inventory Panel</h3>

          <div className="flex items-baseline space-x-2">
            <h4 className="font-heading text-lg font-medium text-white">Cost Surface</h4>
            <InfoButton theme="tertiary">
              <div>
                <h4 className="mb-2.5 font-heading text-lg">What is a Cost Surface?</h4>
                <div className="space-y-2">
                  <p>
                    Marxan aims to minimize socio-economic impacts and conflicts between uses
                    through what is called the “cost” surface. In conservation planning, cost data
                    may reflect acquisition, management, or opportunity costs ($), but may also
                    reflect non-monetary impacts. Proxies are commonly used in absence of fine-scale
                    socio-economic information. A default value for cost will be the planning unit
                    area but you can upload your cost surface.
                  </p>
                  <p>
                    In the examples below, we illustrate how distance from a city, road or port can
                    be used as a proxy cost surface. In these examples, areas with many competing
                    activities will make a planning unit cost more than areas further away with less
                    competition for access.
                  </p>
                  <Image src={COST_SEA_IMG} alt="Cost sea" width={280} height={100} />
                  <Image src={COST_LAND_IMG} alt="Cost Land" width={280} height={100} />
                </div>
              </div>
            </InfoButton>
          </div>
        </div>
        {/* <CostSurfaceUploader /> */}
      </div>
    </div>
  );
};

export default InventoryPanelCostSurface;
