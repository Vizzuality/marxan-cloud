import { Feature } from './feature';
import { Project } from './project';

export interface GeoFeatureSet {
  status: 'draft';
  features: {
    kind: 'plain';
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
    geoprocessingOperations: any;
  }[];
}
