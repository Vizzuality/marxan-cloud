import { RemoteFeaturesData } from '../entities/remote-features-data.geo.entity';
import { RemoteScenarioFeaturesData } from '../entities/remote-scenario-features-data.geo.entity';
import { GeoFeature } from '../../geo-features/geo-feature.api.entity';
declare type RawRemoteScenarioFeaturesData = Pick<RemoteScenarioFeaturesData, 'id' | 'target' | 'scenarioId' | 'fpf' | 'featuresDataId' | 'totalArea' | 'currentArea' | 'target2'>;
export declare const getValidNonGeoData: (scenarioId: string) => [RawRemoteScenarioFeaturesData[], number];
export declare const getValidRemoteFeatureData: () => RemoteFeaturesData[];
export declare const getValidGeoFeature: () => GeoFeature[];
export {};
