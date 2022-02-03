import { Permit } from '@marxan-api/modules/access-control/access-control.types';
import { Either } from 'fp-ts/lib/Either';
import { forbiddenError } from '..';
import { ScenarioLockDto } from './locks/dto/scenario.lock.dto';
import { lockedScenario } from './locks/lock.service';
export abstract class ScenarioAccessControl {
  abstract canEditScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canViewScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canDeleteScenario(
    scenarioId: string,
    userId: string,
  ): Promise<Permit>;
  abstract canCreateScenario(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract canCloneScenario(userId: string, projectId: string): Promise<Permit>;
  abstract canReleaseLock(userId: string, projectId: string): Promise<Permit>;
  abstract acquireLock(
    userId: string,
    scenarioId: string,
  ): Promise<
    Either<typeof forbiddenError | typeof lockedScenario, ScenarioLockDto>
  >;
  abstract releaseLock(
    userId: string,
    scenarioId: string,
  ): Promise<Either<typeof forbiddenError, void>>;
}
