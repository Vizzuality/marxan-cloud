import Image from 'next/image';

import COST_LAND_IMG from 'images/info-buttons/img_cost_surface_marine.png';
import COST_SEA_IMG from 'images/info-buttons/img_cost_surface_terrestrial.png';

const CostSurfaceInfo = (): JSX.Element => (
  <div>
    <h4 className="mb-2.5 font-heading text-lg">What is a Cost Surface?</h4>
    <div className="space-y-2">
      <p>
        Marxan aims to minimize socio-economic impacts and conflicts between uses through what is
        called the “cost” surface. In conservation planning, cost data may reflect acquisition,
        management, or opportunity costs ($), but may also reflect non-monetary impacts. Proxies are
        commonly used in absence of fine-scale socio-economic information. A default value for cost
        will be the planning unit area but you can upload your cost surface.
      </p>
      <p>
        In the examples below, we illustrate how distance from a city, road or port can be used as a
        proxy cost surface. In these examples, areas with many competing activities will make a
        planning unit cost more than areas further away with less competition for access.
      </p>
      <div className="flex flex-col items-center pt-6">
        <Image src={COST_SEA_IMG} alt="Cost sea" height={200} width={270} />
        <Image src={COST_LAND_IMG} alt="Cost Land" height={200} width={270} />
      </div>
    </div>
  </div>
);

export default CostSurfaceInfo;
