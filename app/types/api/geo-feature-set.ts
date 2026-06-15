import { Feature } from './feature';
import { Project } from './project';
import { SplitEntry } from './split';

export interface GeoprocessingOperationSplitV1 {
  kind: 'split/v1';
  splitByProperty: string;
  splits: SplitEntry[];
}

export interface GeoFeatureSet {
  status: 'draft' | 'created';
  features: {
    kind: 'plain' | 'withGeoprocessing';
    featureId: Feature['id'];
    marxanSettings: Record<string, number>;
    metadata: {
      id: string;
      alias?: Feature['alias'];
      description?: Feature['description'];
      tag?: Feature['tag'];
      featureClassName: Feature['featureClassName'];
      isCustom: Feature['isCustom'];
      isLegacy: boolean;
      projectId: Project['id'];
      properties: Record<string, [number]>;
    };
    geoprocessingOperations?: GeoprocessingOperationSplitV1[];
  }[];
}
