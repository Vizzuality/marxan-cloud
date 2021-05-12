import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GeoFeatureGeometry, GeoFeaturePropertySet } from './geo-feature.geo.entity';
import { CreateGeoFeatureDTO } from './dto/create.geo-feature.dto';
import { UpdateGeoFeatureDTO } from './dto/update.geo-feature.dto';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
import { GeoFeature } from './geo-feature.api.entity';
import { FetchSpecification } from 'nestjs-base-service';
import { Project } from 'modules/projects/project.api.entity';
declare const geoFeatureFilterKeyNames: readonly ["featureClassName", "alias", "description", "source", "propertyName", "tag", "projectId"];
declare type GeoFeatureFilterKeys = keyof Pick<GeoFeature, typeof geoFeatureFilterKeyNames[number]>;
declare type GeoFeatureFilters = Record<GeoFeatureFilterKeys, string[]>;
export declare class GeoFeaturesService extends AppBaseService<GeoFeature, CreateGeoFeatureDTO, UpdateGeoFeatureDTO, AppInfoDTO> {
    private readonly geoFeaturesGeometriesRepository;
    private readonly geoFeaturePropertySetsRepository;
    private readonly geoFeaturesRepository;
    private readonly projectRepository;
    constructor(geoFeaturesGeometriesRepository: Repository<GeoFeatureGeometry>, geoFeaturePropertySetsRepository: Repository<GeoFeaturePropertySet>, geoFeaturesRepository: Repository<GeoFeature>, projectRepository: Repository<Project>);
    get serializerConfig(): JSONAPISerializerConfig<GeoFeature>;
    fakeFindOne(_id: string): Promise<GeoFeature>;
    private _fakeGeoFeatureProperty;
    setFilters(query: SelectQueryBuilder<GeoFeature>, filters: GeoFeatureFilters, _info?: AppInfoDTO): SelectQueryBuilder<GeoFeature>;
    extendFindAllQuery(query: SelectQueryBuilder<GeoFeature>, fetchSpecification: FetchSpecification, info: AppInfoDTO): Promise<SelectQueryBuilder<GeoFeature>>;
    extendFindAllResults(entitiesAndCount: [any[], number], fetchSpecification?: FetchSpecification, _info?: AppInfoDTO): Promise<[any[], number]>;
    extendGetByIdResult(entity: GeoFeature, _fetchSpecification?: FetchSpecification, _info?: AppInfoDTO): Promise<GeoFeature>;
}
export {};
