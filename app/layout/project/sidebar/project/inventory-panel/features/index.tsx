import { useCallback, useState } from 'react';

import { useAppDispatch } from 'store/hooks';
import { setSearch } from 'store/slices/projects/[id]';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Search, { SearchProps } from 'components/search';
import Section from 'layout/section';

import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

import ProjectFeatureList from './list';
import FeatureUploadModal from './modals/upload';

const InventoryPanelFeatures = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const handleSearch = useCallback(
    (value: Parameters<SearchProps['onChange']>[0]) => {
      dispatch(setSearch(value));
    },
    [dispatch]
  );
  const [isOpenFeatureUploader, setOpenFeatureUploader] = useState(false);

  const handleFeatureUploader = useCallback(() => {
    setOpenFeatureUploader(true);
  }, []);

  const closeFeatureUploadModal = useCallback(() => {
    setOpenFeatureUploader(false);
  }, []);

  return (
    <Section className="relative">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Inventory Panel</span>
          <h3 className="flex items-center space-x-2">
            <span className="text-lg font-medium">Features</span>
            <InfoButton theme="tertiary">
              <>
                <h4 className="mb-2.5 font-heading text-lg">What are features?</h4>
                <div className="space-y-2">
                  <p>
                    Features are the important habitats, species, processes, activities, and
                    discrete areas that you want to consider in your planning process. Common
                    feature data formats are range maps, polygons, abundances, and continuous scale
                    or probability of occurrence maps (e.g. 0-1). Features can include more than
                    just ecological data but also be cultural and socio-economic areas like
                    community fishing grounds or traditional-use areas, and other human activities
                    and industries. Every feature must have a minimum target amount set. Some
                    examples include:
                  </p>
                  <img src={FEATURE_SPECIES_IMG} alt="Feature-Range" />
                  <img src={FEATURE_ABUND_IMG} alt="Feature-Abundance" />
                  <img src={FEATURE_SOCIAL_IMG} alt="Feature-Social" />
                </div>
              </>
            </InfoButton>
          </h3>
        </div>
        <Button theme="primary" size="base" onClick={handleFeatureUploader} className="space-x-3">
          <span>Upload</span>
          <Icon icon={UPLOAD_SVG} className="h-5 w-5 stroke-current" />
        </Button>
      </header>
      <Search
        id="feature-search"
        size="sm"
        placeholder="Search features"
        aria-label="Search features"
        onChange={handleSearch}
        theme="dark"
      />
      <ProjectFeatureList />
      <FeatureUploadModal isOpen={isOpenFeatureUploader} onDismiss={closeFeatureUploadModal} />
    </Section>
  );
};

export default InventoryPanelFeatures;
