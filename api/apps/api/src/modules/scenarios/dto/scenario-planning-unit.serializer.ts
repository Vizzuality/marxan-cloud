import { Injectable } from '@nestjs/common';
import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { ScenarioPlanningUnitDto } from './scenario-planning-unit.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ScenarioPlanningUnitSerializer {
  serialize(
    units: ScenariosPlanningUnitGeoEntity[],
  ): ScenarioPlanningUnitDto[] {
    return plainToClass<ScenarioPlanningUnitDto, ScenarioPlanningUnitDto>(
      ScenarioPlanningUnitDto,
      units.map((unit) => ({
        id: unit.id,
        inclusionStatus: unit.lockStatus,
        defaultStatus: unit.protectedByDefault
          ? LockStatus.LockedIn
          : LockStatus.Unstated,
      })),
    );
  }
}
