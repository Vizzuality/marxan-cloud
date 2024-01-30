import { NavigationInventoryTabs } from 'layout/project/navigation/types';

import ConservationAreasTable from './conservation-areas';
import ConservationAreasFooter from './conservation-areas/footer';
import WDPAUploadModal from './conservation-areas/modals/upload';
import CostSurfaceTable from './cost-surfaces';
import CostSurfaceInfo from './cost-surfaces/info';
import CostSurfaceUploadModal from './cost-surfaces/modals/upload';
import FeaturesTable from './features';
import FeaturesInfo from './features/info';
import FeatureUploadModal from './features/modals/upload';
import { InventoryPanel } from './types';

export const INVENTORY_TABS = {
  'conservation-areas': {
    title: 'Conservation Areas',
    search: 'Search conservation areas',
    noData: 'No conservation areas found.',
    TableComponent: ConservationAreasTable,
    FooterComponent: ConservationAreasFooter,
    UploadModalComponent: WDPAUploadModal,
  },
  'cost-surface': {
    title: 'Cost Surface',
    search: 'Search cost surfaces',
    noData: 'No cost surfaces found.',
    InfoComponent: CostSurfaceInfo,
    UploadModalComponent: CostSurfaceUploadModal,
    TableComponent: CostSurfaceTable,
  },
  features: {
    title: 'Features',
    search: 'Search features',
    noData: 'No features found.',
    InfoComponent: FeaturesInfo,
    UploadModalComponent: FeatureUploadModal,
    TableComponent: FeaturesTable,
  },
} satisfies {
  [key in NavigationInventoryTabs]: InventoryPanel;
};
