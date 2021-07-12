import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ScenariosOutputResultsApiEntity } from '@marxan/scenarios-planning-unit';

class ScenarioSolutionsDataDto {
  @ApiProperty()
  type: 'solutions' = 'solutions';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    isArray: true,
    type: () => ScenariosOutputResultsApiEntity,
  })
  attributes!: ScenariosOutputResultsApiEntity[];
}

class ScenarioSolutionDataDto {
  @ApiProperty()
  type: 'solution' = 'solution';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    type: () => ScenariosOutputResultsApiEntity,
  })
  attributes!: ScenariosOutputResultsApiEntity;
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
