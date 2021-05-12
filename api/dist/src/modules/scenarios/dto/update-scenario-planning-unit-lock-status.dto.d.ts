import { FeatureCollection } from 'geojson';
export declare class PlanningUnitsByIdUpdateDto {
    include?: string[];
    exclude?: string[];
}
export declare class PlanningUnitsByGeoJsonUpdateDto {
    include?: FeatureCollection[];
    exclude?: FeatureCollection[];
}
export declare class UpdateScenarioPlanningUnitLockStatusDto {
    byId?: PlanningUnitsByIdUpdateDto;
    byGeoJson?: PlanningUnitsByGeoJsonUpdateDto;
}
