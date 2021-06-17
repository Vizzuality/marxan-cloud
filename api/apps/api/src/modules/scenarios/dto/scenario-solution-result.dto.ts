import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';

class ScenarioSolutionsDataDto {
  @ApiProperty()
  type: 'solutions' = 'solutions';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    isArray: true,
    type: () => ScenariosOutputResultsGeoEntity,
  })
  attributes!: ScenariosOutputResultsGeoEntity[];
}

class ScenarioSolutionDataDto {
  @ApiProperty()
  type: 'solution' = 'solution';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    type: () => ScenariosOutputResultsGeoEntity,
  })
  attributes!: ScenariosOutputResultsGeoEntity;
}

@ApiExtraModels(ScenarioSolutionsDataDto, ScenarioSolutionDataDto)
export class ScenarioSolutionResultDto {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(ScenarioSolutionsDataDto) },
      { $ref: getSchemaPath(ScenarioSolutionDataDto) },
    ],
  })
  data!: ScenarioSolutionsDataDto | ScenarioSolutionDataDto;
}
