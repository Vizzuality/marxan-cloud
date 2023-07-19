import { useState } from 'react';

import Image from 'next/image';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button/component';

import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

import UPLOADER_SVG from 'svgs/ui/uploader.svg?sprite';

const InventoryPanelFeatures = (): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-start justify-between rounded-xl bg-gray-700 p-6">
      <div>
        <h3 className="font-sans text-xs font-semibold text-blue-500">Inventory Panel</h3>

        <div className="flex items-baseline space-x-2">
          <h4 className="font-heading text-lg font-medium text-white">Features</h4>
          <InfoButton theme="tertiary">
            <div>
              <h4 className="mb-2.5 font-heading text-lg">What are features?</h4>
              <div className="space-y-2">
                <p>
                  Features are the important habitats, species, processes, activities, and discrete
                  areas that you want to consider in your planning process. Common feature data
                  formats are range maps, polygons, abundances, and continuous scale or probability
                  of occurrence maps (e.g. 0-1). Features can include more than just ecological data
                  but also be cultural and socio-economic areas like community fishing grounds or
                  traditional-use areas, and other human activities and industries. Every feature
                  must have a minimum target amount set. Some examples include:
                </p>
                <Image src={FEATURE_SPECIES_IMG} alt="Feature-Range" width={280} height={100} />
                <Image src={FEATURE_ABUND_IMG} alt="Feature-Abundance" width={280} height={100} />
                <Image src={FEATURE_SOCIAL_IMG} alt="Feature-Social" width={280} height={100} />
              </div>
            </div>
          </InfoButton>
        </div>
      </div>
      <Button className="h-10 !px-4" theme="primary" size="s" onClick={() => setOpen(true)}>
        <span className="mr-1 text-sm">Upload</span>
        <Icon icon={UPLOADER_SVG} className="h-6 w-6 text-black" />
      </Button>
    </div>
  );
};

export default InventoryPanelFeatures;
