import { PartialType } from '@nestjs/swagger';
import { CreateScenarioDTO } from './create.scenario.dto';

export class UpdateScenarioDTO extends PartialType(CreateScenarioDTO) {}
