/**
 * @todo We are replicating the same code that we have in the api. If we update something here we should also replicate it in the api side.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('features_data')
export class GeoFeatureGeometry {
  @ApiProperty()
  @PrimaryColumn()
  id!: string;

  @ApiProperty()
  @Column('uuid', { name: 'feature_id' })
  featuresId!: string;

  @ApiProperty()
  @Column('jsonb', { name: 'properties' })
  properties!: string;
}
