import { NavigationInventoryTabs } from 'layout/project/navigation/types';

import CostSurfaceTable from './cost-surfaces';
import CostSurfaceInfo from './cost-surfaces/info';
import FeaturesTable from './features';
import FeaturesInfo from './features/info';
import FeatureUploadModal from './features/modals/upload';
import { InventoryPanel } from './types';
import ProtectedAreasTable from './wdpas';
import ProtectedAreasFooter from './wdpas/footer';

export const INVENTORY_TABS = {
  'protected-areas': {
    title: 'Protected Areas',
    search: 'Search protected areas',
    noData: 'No protected areas found.',
    TableComponent: ProtectedAreasTable,
    FooterComponent: ProtectedAreasFooter,
  },
  'cost-surface': {
    title: 'Cost Surface',
    search: 'Search cost surfaces',
    noData: 'No cost surfaces found.',
    InfoComponent: CostSurfaceInfo,
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
