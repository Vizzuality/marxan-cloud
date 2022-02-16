import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  forbiddenError,
  lastOwner,
  transactionFailed,
  queryFailed,
} from '@marxan-api/modules/access-control';
import { notFound as marxanRunNotFound } from '@marxan-api/modules/scenarios/marxan-run';
import {
  scenarioNotFound,
  unknownError as blmUnknownError,
} from '@marxan-api/modules/blm/values/blm-repos';
import {
  projectDoesntExist,
  projectNotReady,
} from '@marxan-api/modules/scenarios/scenarios.service';
import { blmCreationFailure } from '@marxan-api/modules/scenarios/blm-calibration/create-initial-scenario-blm.command';
import { jobSubmissionFailed } from '@marxan/scenario-cost-surface';
import {
  nullPlanningUnitGridShape,
  projectNotFound as initialCostProjectNotFound,
} from '@marxan-api/modules/scenarios/cost-surface/application/set-initial-cost-surface.command';
import { internalError } from '@marxan-api/modules/specification/application/submit-specification.command';
import {
  noLockInPlace,
  lockedByAnotherUser,
  lockedScenario,
  unknownError as lockUnknownError,
} from '@marxan-api/modules/access-control/scenarios-acl/locks/lock.service';
import {
  marxanFailed,
  metadataNotFound,
  outputZipNotYetAvailable,
} from '@marxan-api/modules/scenarios/output-files/output-files.service';
import {
  inputZipNotYetAvailable,
  metadataNotFound as inputMetadataNotFound,
} from '@marxan-api/modules/scenarios/input-files';
import { notFound as protectedAreaProjectNotFound } from '@marxan/projects';
import { invalidProtectedAreaId } from '@marxan-api/modules/scenarios/protected-area/selection/selection-update.service';
import { submissionFailed } from '@marxan-api/modules/scenarios/protected-area';
import {
  invalidRange,
  updateFailure,
  unknownError as rangeUnknownError,
} from '@marxan-api/modules/scenarios/blm-calibration/change-scenario-blm-range.command';

interface ErrorHandlerOptions {
  projectId?: string;
  range?: [number, number];
  resourceType?: string;
  scenarioId?: string;
  userId?: string;
}

export const aclErrorHandler = (
  errorToCheck:
    | typeof forbiddenError
    | typeof lastOwner
    | typeof transactionFailed
    | typeof queryFailed
    | typeof noLockInPlace
    | typeof lockedByAnotherUser
    | typeof lockUnknownError
    | typeof lockedScenario
    | typeof internalError
    | typeof blmUnknownError
    | typeof marxanFailed
    | typeof outputZipNotYetAvailable
    | typeof metadataNotFound
    | typeof marxanRunNotFound
    | typeof inputMetadataNotFound
    | typeof inputZipNotYetAvailable
    | typeof scenarioNotFound
    | typeof invalidProtectedAreaId
    | typeof projectNotReady
    | typeof projectDoesntExist
    | typeof protectedAreaProjectNotFound
    | typeof invalidRange
    | typeof updateFailure
    | typeof rangeUnknownError
    | typeof blmCreationFailure
    | typeof jobSubmissionFailed
    | typeof submissionFailed
    | typeof nullPlanningUnitGridShape
    | typeof initialCostProjectNotFound,
  options?: ErrorHandlerOptions,
) => {
  switch (errorToCheck) {
    case forbiddenError:
      throw new ForbiddenException(
        `User with ID: ${options?.userId} is not allowed to perform this action on ${options?.resourceType}.`,
      );
    case lastOwner:
      throw new ForbiddenException(`There must be at least one owner.`);
    case queryFailed:
      throw new BadRequestException(
        `Error while adding record to the database.`,
      );
    case transactionFailed:
      throw new InternalServerErrorException(`Transaction failed.`);
    case lockUnknownError:
      throw new InternalServerErrorException();
    case lockedByAnotherUser:
      throw new BadRequestException(
        `Scenario lock belongs to a different user.`,
      );
    case lockedScenario:
      throw new BadRequestException(
        `Scenario ${options?.scenarioId} is already being edited.`,
      );
    case noLockInPlace:
      throw new NotFoundException(
        `Scenario ${options?.scenarioId} has no locks in place.`,
      );
    case internalError:
      throw new InternalServerErrorException(errorToCheck.description);
    case marxanRunNotFound:
      throw new NotFoundException(`Entity not found.`);
    case blmUnknownError:
      throw new InternalServerErrorException();
    case scenarioNotFound:
      throw new NotFoundException(
        `Scenario ${options?.scenarioId} could not be found.`,
      );
    case marxanFailed:
      throw new InternalServerErrorException('Marxan failed.');
    case outputZipNotYetAvailable:
      throw new InternalServerErrorException(
        'Marxan output file - output file not available, possible error.',
      );
    case metadataNotFound:
      throw new InternalServerErrorException('Marxan was not yet executed.');
    case inputZipNotYetAvailable:
      throw new InternalServerErrorException(
        'Marxan input file - input file not available, possible error.',
      );
    case inputMetadataNotFound:
      throw new InternalServerErrorException(
        'Marxan input file - metadata not found.',
      );
    case projectNotReady:
      throw new ConflictException('Project is not ready.');
    case projectDoesntExist:
      throw new NotFoundException(`Project doesn't exist.`);
    case protectedAreaProjectNotFound:
      throw new NotFoundException('Project not found.');
    case invalidProtectedAreaId:
      throw new BadRequestException('Invalid protected area id.');
    case rangeUnknownError:
      throw new InternalServerErrorException();
    case updateFailure:
      throw new InternalServerErrorException();
    case invalidRange:
      throw new BadRequestException(
        `Received range is invalid: [${options?.range}]`,
      );
    case blmCreationFailure:
      throw new InternalServerErrorException(
        `Could not create initial BLM for scenario.`,
      );
    case jobSubmissionFailed:
      throw new InternalServerErrorException('Job submission failed.');
    case submissionFailed:
      throw new InternalServerErrorException(
        'System could not submit the async job.',
      );
    case nullPlanningUnitGridShape:
      throw new BadRequestException('Invalid planing unit grid shape.');
    case initialCostProjectNotFound:
      throw new NotFoundException('Project not found.');
    default:
      const _exhaustiveCheck: never = errorToCheck;
      throw _exhaustiveCheck;
  }
};
