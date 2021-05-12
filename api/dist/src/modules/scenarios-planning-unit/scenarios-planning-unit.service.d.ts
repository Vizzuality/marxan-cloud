import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppBaseService, JSONAPISerializerConfig } from '../../utils/app-base.service';
import { ScenariosPlanningUnitGeoEntity } from './entities/scenarios-planning-unit.geo.entity';
import { UserSearchCriteria } from './search-criteria';
import { FiltersSpecification } from 'nestjs-base-service';
export declare class ScenariosPlanningUnitService extends AppBaseService<ScenariosPlanningUnitGeoEntity, never, never, UserSearchCriteria> {
    private readonly puData;
    constructor(puData: Repository<ScenariosPlanningUnitGeoEntity>);
    setFilters(query: SelectQueryBuilder<ScenariosPlanningUnitGeoEntity>, filters?: FiltersSpecification['filter'], info?: UserSearchCriteria): SelectQueryBuilder<ScenariosPlanningUnitGeoEntity>;
    get serializerConfig(): JSONAPISerializerConfig<ScenariosPlanningUnitGeoEntity>;
}
