import { ViewColumn, ViewEntity } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ViewEntity({
  expression: `select scenarios."id"              as id,
                      features.id                 as featureId,
                      projects."id"               as projectId,
                      features.description,
                      features.tag,
                      features.feature_class_name as name
               from scenarios
                      join projects on (scenarios.project_id = projects."id")
                      join features on (features.project_id = projects."id")`,
})
export class ScenariosFeaturesView {
  @ViewColumn()
  id?: string | null;

  @ViewColumn()
  projectId?: string | null;

  // public
  @ApiPropertyOptional()
  @ViewColumn()
  featureId?: string | null;

  @ApiPropertyOptional()
  @ViewColumn()
  tag?: string | null;

  @ApiPropertyOptional({
    description: `Name of the feature, for example \`Lion in Deserts\`.`,
  })
  @ViewColumn()
  name?: string | null;

  @ApiPropertyOptional({
    description: `Description of the feature.`,
  })
  @ViewColumn()
  description?: string | null;

  // extended by service based on geoprocessing db
  // ---

  @ApiProperty({
    description: `0-100 (%) value of target protection coverage of all available species.`,
  })
  target?: number;

  @ApiProperty({
    description: `Equivalent of \`target\` percentage in covered area, expressed in m^2`,
  })
  targetArea?: number;

  @ApiProperty({
    description: `Total area space, expressed in m^2`,
  })
  totalArea?: number;

  @ApiProperty({
    description: `0-100 (%) value of how many species % is protected currently.`,
  })
  met?: number;

  @ApiProperty({
    description: `Equivalent of \`met\` percentage in covered area, expressed in m^2`,
  })
  metArea?: number;

  @ApiProperty({
    description: `Shorthand value if current \`met\` is good enough compared to \`target\`.`,
  })
  onTarget?: boolean;

  @ApiProperty({
    description: `Feature Penalty Factor for this feature run.`,
  })
  fpf?: number;
}
