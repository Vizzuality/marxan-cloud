import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Geometry } from 'geojson';

export const scenarioPuRequestEntityName = 'scenario_pu_requested_status';

/**
 *  represents spatial data using longitude and latitude coordinates on the Earth's surface as defined in the WGS84 standard, which is also used for the Global Positioning System (GPS)
 */
const srid = 4326;

@Entity(scenarioPuRequestEntityName)
export class ScenarioPuRequestGeo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'scenario_id', nullable: false })
  scenarioId!: string;

  @Column({
    name: 'included_planning_unit_ids',
    nullable: false,
    type: 'simple-array',
    default: () => '', // https://github.com/typeorm/typeorm/issues/1532
  })
  includedPlantingUnits!: string[];

  @Column({
    name: 'excluded_planning_unit_ids',
    nullable: false,
    type: 'simple-array',
    default: () => '',
  })
  excludedPlantingUnits!: string[];

  @Column({
    name: 'included_from_geojson',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid,
    nullable: true,
  })
  @Check(
    'scenario_included_pu_geojson_valid_check',
    'ST_IsValid(included_from_geojson)',
  )
  includedFromGeoJson!: Geometry | null;

  @Column({
    name: 'included_from_shapefile',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid,
    nullable: true,
  })
  @Check(
    'scenario_included_pu_shapefile_valid_check',
    'ST_IsValid(included_from_shapefile)',
  )
  includedFromShapefile!: Geometry | null;

  @Column({
    name: 'excluded_from_geojson',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid,
    nullable: true,
  })
  @Check(
    'scenario_excluded_pu_geojson_valid_check',
    'ST_IsValid(excluded_from_geojson)',
  )
  excludedFromGeoJson!: Geometry | null;

  @Column({
    name: 'excluded_from_shapefile',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid,
    nullable: true,
  })
  @Check(
    'scenario_excluded_pu_shapefile_valid_check',
    'ST_IsValid(excluded_from_shapefile)',
  )
  excludedFromShapefile!: Geometry | null;
}
