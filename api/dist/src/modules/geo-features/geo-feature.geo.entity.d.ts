import { BaseServiceResource } from 'types/resource.interface';
export declare const geoFeatureResource: BaseServiceResource;
export declare class GeoFeatureGeometry {
    id: string;
}
export declare class JSONAPIGeoFeaturesGeometryData {
    type: string;
    id: string;
    attributes: GeoFeatureGeometry;
}
export declare class GeoFeatureResult {
    data: JSONAPIGeoFeaturesGeometryData;
}
export declare class GeoFeaturePropertySet {
    featureId: string;
    properties: Record<string, unknown>;
}
