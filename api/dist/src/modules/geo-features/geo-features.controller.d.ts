import { GeoFeatureResult } from './geo-feature.geo.entity';
import { GeoFeaturesService } from './geo-features.service';
import { FetchSpecification } from 'nestjs-base-service';
export declare class GeoFeaturesController {
    readonly service: GeoFeaturesService;
    constructor(service: GeoFeaturesService);
    findAll(fetchSpecification: FetchSpecification): Promise<GeoFeatureResult>;
    findOne(id: string): Promise<GeoFeatureResult>;
}
