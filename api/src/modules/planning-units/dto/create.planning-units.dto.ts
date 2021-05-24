import { PickType } from '@nestjs/swagger';
import { CreateProjectDTO } from 'modules/projects/dto/create.project.dto';

export class CreatePlanningUnitsDTO extends PickType(CreateProjectDTO,['extent','countryId','adminAreaLevel1Id','adminAreaLevel2Id','planningUnitAreakm2','planningUnitGridShape'] as const) {

}
