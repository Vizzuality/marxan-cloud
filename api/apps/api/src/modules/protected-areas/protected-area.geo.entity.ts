import { IUCNCategory } from '@marxan/iucn';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wdpa')
export class ProtectedArea {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * WDPA id.
   */
  @ApiProperty()
  @Column('double precision', { name: 'wdpaid' })
  wdpaId?: number;

  /**
   * Full name of the protected area.
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'full_name' })
  fullName?: string;

  /**
   * IUCN category.
   *
   * Only applies to IUCN-defined protected areas.
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'iucn_cat' })
  iucnCategory?: IUCNCategory;

  /**
   * Total length of the protected area's shape.
   */
  @ApiPropertyOptional()
  @Column('double precision', { name: 'shape_leng' })
  shapeLength?: number;

  /**
   * Total area of the protected area's shape.
   */
  @ApiPropertyOptional()
  @Column('double precision', { name: 'shape_area' })
  shapeArea?: number;

  /**
   * Country where the protected area is located.
   *
   * This references the admin_regions.gid_0 column.
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'iso3' })
  countryId?: string;

  /**
   * Protection status of the area.
   *
   * For example: "Inscribed", or "Designated".
   */
  @ApiPropertyOptional()
  @Column('text')
  status?: string;

  /**
   * Protection designation.
   */
  @ApiPropertyOptional()
  @Column('text', { name: 'desig' })
  designation?: string;

  /**
   * Geometry for the protected area.
   *
   * GeoJSON representation when retrieved from db.
   */
  @ApiPropertyOptional()
  @Column('geometry', { name: 'the_geom' })
  theGeom?: Record<string, unknown>;
}

export class JSONAPIProtectedAreaData {
  @ApiProperty()
  type = 'protected_areas';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: ProtectedArea;
}

export class ProtectedAreaResult {
  @ApiProperty()
  data!: JSONAPIProtectedAreaData;
}
