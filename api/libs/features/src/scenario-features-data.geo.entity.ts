import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GeoFeatureGeometry } from '../../geofeatures/src';

@Entity(`scenario_features_data`)
export class ScenarioFeaturesData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'feature_class_id' })
  featureDataId!: string;

  @Column({ name: 'api_feature_id' })
  apiFeatureId!: string;

  @Column({ name: 'scenario_id' })
  scenarioId!: string;

  @Column({ name: 'specification_id', type: 'uuid' })
  specificationId!: string;

  @Column({ name: 'total_area' })
  /**
   *  total area of the feature in the study area
   */
  totalArea!: number;

  @Column({ name: 'current_pa' })
  /**
   *  total area of the feature which is protected within the study area
   */
  currentArea!: number;

  @ApiProperty({
    description: `Feature Penalty Factor for this feature run.`,
  })
  @Column()
  /**
   * penalty factor
   */
  fpf?: number;

  @ApiProperty({
    description: `Total area space, expressed in m^2`,
  })
  @Column()
  /**
   * target to be met for protection
   */
  target?: number;

  @ApiProperty({
    description:
      'Protection target for this feature, as proportion of the conservation feature to be included in the reserve system.',
  })
  @Column({
    name: `prop`,
    type: `float8`,
  })
  prop?: number;

  @Column({
    name: `sepnum`,
    type: `float8`,
  })
  sepNum?: number;

  @Column({
    name: `targetocc`,
    type: `float8`,
  })
  targetocc?: number;

  @Column()
  /**
   * not used yet
   * in marxan realm you can set a secondary target for a minimum clump size for the representation of conservation features in the reserve
   */
  target2?: number;

  @Column({
    name: 'metadata',
    type: 'jsonb',
  })
  metadata?: Record<'sepdistance', number | string>;

  @OneToOne(() => GeoFeatureGeometry, (featureData) => featureData.id)
  @JoinColumn({
    name: 'feature_class_id',
    referencedColumnName: 'id',
  })
  featureData!: GeoFeatureGeometry;

  @Column({
    name: `feature_id`,
  })
  featureId!: number;

  @Column({
    name: 'amount_from_legacy_project',
    type: 'double precision',
  })
  amountFromLegacyProject?: number | null;

  @ApiProperty({
    description: `0-100 (%) value of target protection coverage of all available species.`,
  })
  coverageTarget!: number;

  @ApiProperty({
    description: `Equivalent of \`target\` percentage in covered area, expressed in m^2`,
  })
  coverageTargetArea!: number;

  @ApiProperty({
    description: `0-100 (%) value of how many species % is protected currently.`,
  })
  met!: number;

  @ApiProperty({
    description: `Equivalent of \`met\` percentage in covered area, expressed in m^2`,
  })
  metArea!: number;

  @ApiProperty({
    description: `Shorthand value if current \`met\` is good enough compared to \`target\`.`,
  })
  onTarget!: boolean;

  @ApiPropertyOptional({
    description: `Name of the feature, for example \`Lion in Deserts\`.`,
  })
  name?: string | null;

  @ApiPropertyOptional({
    description: `Description of the feature.`,
  })
  description?: string | null;
}
