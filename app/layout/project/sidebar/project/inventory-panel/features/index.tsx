import { useCallback } from 'react';

import { useAppDispatch } from 'store/hooks';
import { setSearch } from 'store/slices/projects/[id]';

import InfoButton from 'components/info-button';
import Search, { SearchProps } from 'components/search';
import AddFeaturesModal from 'layout/scenarios/edit/features/set-up/add/add-modal';

import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

import ProjectFeatureList from './list';

const InventoryPanelFeatures = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const handleSearch = useCallback(
    (value: Parameters<SearchProps['onChange']>[0]) => {
      dispatch(setSearch(value));
    },
    [dispatch]
  );

  return (
    <section className="relative space-y-2 rounded-[20px] bg-gray-700 p-6">
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
        <AddFeaturesModal />
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
    </section>
  );
};

export default InventoryPanelFeatures;
