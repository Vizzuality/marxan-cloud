import { ApiProperty } from '@nestjs/swagger';

export class ScenarioFeatureDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    description: `Name of the feature, for example \`Lion in Deserts\``,
  })
  name!: string;

  @ApiProperty()
  tag!: string;

  @ApiProperty({
    description: `0-1 (0-100%) value of target protection coverage of all available species.`,
  })
  target!: number;

  @ApiProperty({
    description: `Equivalent of \`target\` percentage in covered area in m^2`,
  })
  targetArea!: number;

  @ApiProperty({
    description: `0-1 (0-100%) value of how many species % is protected currently.`,
  })
  met!: number;

  @ApiProperty({
    description: `Equivalent of \`met\` percentage in covered area in m^2`,
  })
  metArea!: number;

  @ApiProperty({
    description: `Shorthand value if current \`met\` is good enough compared to \`target\`.`,
  })
  onTarget!: boolean;

  @ApiProperty({
    description: `Feature Penalty Factor for this feature run.`,
  })
  fpf!: number;
}
