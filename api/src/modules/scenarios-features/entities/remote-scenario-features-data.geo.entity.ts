import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FeatureTags } from '../../geo-features/geo-feature.api.entity';

export const remoteScenarioFeaturesDataViewName = 'scenario_features_data';

@Entity(remoteScenarioFeaturesDataViewName)
export class RemoteScenarioFeaturesData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * well, due to how BasicService works, we cannot use @Column({ name: 'feature_class_id'}) and give property different name
   */
  @Column()
  feature_class_id!: string;

  @Column()
  scenario_id!: string;

  @Column()
  /**
   *  total area of the feature in the study area
   */
  total_area!: string;

  @Column()
  /**
   *  total area of the feature in the study area
   */
  current_pa!: string;

  @ApiProperty({
    description: `Feature Penalty Factor for this feature run.`,
  })
  @Column()
  /**
   * penalty factor
   */
  fpf!: number;

  @Column()
  /**
   * target to be met for protection
   */
  target!: number;

  @Column()
  /**
   * not used yet
   * in marxan realm you can set a secondary target for a minimum clump size for the representation of conservation features in the reserve
   */
  target2!: number;

  /**
   * no FK
   */
  // @OneToOne(() => RemoteFeaturesData, (featureData) => featureData.id)
  // @JoinColumn()
  // featureData!: RemoteFeaturesData;

  // what we map

  @ApiProperty({
    description: `0-100 (%) value of target protection coverage of all available species.`,
  })
  coverageTarget!: number;

  @ApiProperty({
    description: `Equivalent of \`target\` percentage in covered area, expressed in m^2`,
  })
  coverageTargetArea!: number;

  @ApiProperty({
    description: `Total area space, expressed in m^2`,
  })
  totalArea!: number;

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

  // what we expose with Extend
  @ApiProperty({
    enum: FeatureTags,
  })
  tag!: FeatureTags;

  @ApiPropertyOptional({
    description: `Name of the feature, for example \`Lion in Deserts\`.`,
  })
  name?: string | null;

  @ApiPropertyOptional({
    description: `Description of the feature.`,
  })
  description?: string | null;
}
