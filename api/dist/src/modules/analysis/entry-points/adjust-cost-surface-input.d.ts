import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
export interface CostSurfaceInputDto {
    geo: FeatureCollection<MultiPolygon | Polygon, {
        cost: number;
        planningUnitId: string;
    }>;
}
