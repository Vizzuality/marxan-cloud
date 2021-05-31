import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScenariosFeaturesView {
  @ApiProperty()
  featureId!: string;

  @ApiPropertyOptional()
  tag?: string | null;

  @ApiPropertyOptional({
    description: `Name of the feature, for example \`Lion in Deserts\`.`,
  })
  name?: string | null;

  @ApiPropertyOptional({
    description: `Description of the feature.`,
  })
  description?: string | null;

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
