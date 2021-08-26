import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { ScenarioFeaturesPreparation } from './scenario-features-preparation.geo.entity';

@Entity(`scenario_features_data`)
export class ScenarioFeaturesData extends ScenarioFeaturesPreparation {
  @ApiProperty()
  @Column({
    name: `feature_id`,
  })
  featureId!: number;
}
