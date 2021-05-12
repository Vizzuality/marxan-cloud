import { FeatureTags } from '../../geo-features/geo-feature.api.entity';
export declare const remoteScenarioFeaturesDataName = "scenario_features_data";
export declare class RemoteScenarioFeaturesData {
    id: string;
    featuresDataId: string;
    scenarioId: string;
    totalArea: number;
    currentArea: number;
    fpf: number;
    target: number;
    target2: number;
    coverageTarget: number;
    coverageTargetArea: number;
    met: number;
    metArea: number;
    onTarget: boolean;
    tag: FeatureTags;
    featureId: string;
    name?: string | null;
    description?: string | null;
}
