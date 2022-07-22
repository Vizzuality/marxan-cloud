import { ApiProperty } from '@nestjs/swagger';
import { Column, ViewEntity } from 'typeorm';
import { ScenarioFeaturesGapData } from './scenario-features-gap-data.geo.entity';

@ViewEntity('scenario_features_output_gap_data')
export class ScenarioFeaturesOutputGapData extends ScenarioFeaturesGapData {
  @ApiProperty()
  @Column({ name: 'met_occurrences' })
  metOccurrences!: number;

  @ApiProperty()
  @Column({ name: 'run_id' })
  runId!: number;
}
