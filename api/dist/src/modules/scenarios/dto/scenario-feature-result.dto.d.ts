import { ScenariosFeaturesView } from '../../scenarios-features';
declare class ScenarioFeatureDataDto {
    type: 'features';
    id: string;
    attributes: ScenariosFeaturesView[];
}
export declare class ScenarioFeatureResultDto {
    data: ScenarioFeatureDataDto;
}
export {};
