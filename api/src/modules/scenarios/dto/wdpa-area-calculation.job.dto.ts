import { IsUUID } from 'class-validator';
import { PartialType, PickType } from '@nestjs/swagger';
import { CreateScenarioDTO } from './create.scenario.dto';



export class WdpaAreaCalculationDTO extends PickType(CreateScenarioDTO, ['wdpaIucnCategories', 'customProtectedAreaIds', 'wdpaThreshold'] as const){

  @IsUUID(4)
  scenarioId!: string;

}

