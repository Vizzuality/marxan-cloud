import {
  ApiExtraModels,
  ApiProperty,
  getSchemaPath,
  refs,
} from '@nestjs/swagger';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';
import { oneOf } from 'purify-ts';

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
