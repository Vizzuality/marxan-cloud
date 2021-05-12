import { Repository, SelectQueryBuilder } from 'typeorm';
import { FiltersSpecification } from 'nestjs-base-service';
import { AppBaseService, JSONAPISerializerConfig } from '../../utils/app-base.service';
import { GeoFeature } from '../geo-features/geo-feature.api.entity';
import { RemoteScenarioFeaturesData } from './entities/remote-scenario-features-data.geo.entity';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';
import { UserSearchCriteria } from './search-criteria';
export declare class ScenarioFeaturesService extends AppBaseService<RemoteScenarioFeaturesData, never, never, UserSearchCriteria> {
    #private;
    private readonly features;
    private readonly remoteFeature;
    private readonly remoteScenarioFeatures;
    constructor(features: Repository<GeoFeature>, remoteFeature: Repository<RemoteFeaturesData>, remoteScenarioFeatures: Repository<RemoteScenarioFeaturesData>);
    setFilters(query: SelectQueryBuilder<RemoteScenarioFeaturesData>, filters?: FiltersSpecification['filter'], info?: UserSearchCriteria): SelectQueryBuilder<RemoteScenarioFeaturesData>;
    extendFindAllResults(entitiesAndCount: [any[], number]): Promise<[any[], number]>;
    get serializerConfig(): JSONAPISerializerConfig<RemoteScenarioFeaturesData>;
}
