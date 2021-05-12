import { BaseServiceResource } from 'types/resource.interface';
export declare const geoFeatureResource: BaseServiceResource;
export declare enum FeatureTags {
    bioregional = "bioregional",
    species = "species"
}
export interface GeoFeatureProperty {
    key: string;
    distinctValues: string[];
}
export declare class GeoFeature {
    id: string;
    featureClassName?: string;
    description?: string | null;
    source?: string;
    alias?: string | null;
    propertyName?: string;
    intersection?: string[];
    tag: FeatureTags;
    properties?: GeoFeatureProperty[];
    projectId?: string;
}
export declare class JSONAPIGeoFeaturesData {
    type: string;
    id: string;
    attributes: GeoFeature;
}
export declare class GeoFeatureResult {
    data: JSONAPIGeoFeaturesData;
}
