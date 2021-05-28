import { PartialType } from '@nestjs/swagger';
import { CreatePlanningUnitsDTO } from './create.planning-units.dto';

export class UpdatePlanningUnitsDTO extends PartialType(
  CreatePlanningUnitsDTO,
) {}
