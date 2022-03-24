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
import { unknownPdfWebshotError } from '@marxan/webshot';

interface ErrorHandlerOptions {
  projectId?: string;
  range?: [number, number];
  resourceType?: string;
  scenarioId?: string;
  userId?: string;
}

export const mapAclDomainToHttpError = (
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
    | typeof initialCostProjectNotFound
    | typeof unknownPdfWebshotError,
  options?: ErrorHandlerOptions,
) => {
  switch (errorToCheck) {
    case forbiddenError:
      return new ForbiddenException(
        `User with ID: ${options?.userId} is not allowed to perform this action on ${options?.resourceType}.`,
      );
    case lastOwner:
      return new ForbiddenException(`There must be at least one owner.`);
    case queryFailed:
      return new BadRequestException(
        `Error while adding record to the database.`,
      );
    case transactionFailed:
      return new InternalServerErrorException(`Transaction failed.`);
    case lockUnknownError:
      return new InternalServerErrorException();
    case lockedByAnotherUser:
      return new BadRequestException(
        `Scenario lock belongs to a different user.`,
      );
    case lockedScenario:
      return new BadRequestException(
        `Scenario ${options?.scenarioId} is already being edited.`,
      );
    case noLockInPlace:
      return new NotFoundException(
        `Scenario ${options?.scenarioId} has no locks in place.`,
      );
    case internalError:
      return new InternalServerErrorException(errorToCheck.description);
    case marxanRunNotFound:
      return new NotFoundException(`Entity not found.`);
    case blmUnknownError:
      return new InternalServerErrorException();
    case scenarioNotFound:
      return new NotFoundException(
        `Scenario ${options?.scenarioId} could not be found.`,
      );
    case marxanFailed:
      return new InternalServerErrorException('Marxan failed.');
    case outputZipNotYetAvailable:
      return new InternalServerErrorException(
        'Marxan output file - output file not available, possible error.',
      );
    case metadataNotFound:
      return new InternalServerErrorException('Marxan was not yet executed.');
    case inputZipNotYetAvailable:
      return new InternalServerErrorException(
        'Marxan input file - input file not available, possible error.',
      );
    case inputMetadataNotFound:
      return new InternalServerErrorException(
        'Marxan input file - metadata not found.',
      );
    case projectNotReady:
      return new ConflictException('Project is not ready.');
    case projectDoesntExist:
      return new NotFoundException(`Project doesn't exist.`);
    case protectedAreaProjectNotFound:
      return new NotFoundException('Project not found.');
    case invalidProtectedAreaId:
      return new BadRequestException('Invalid protected area id.');
    case rangeUnknownError:
      return new InternalServerErrorException();
    case updateFailure:
      return new InternalServerErrorException();
    case invalidRange:
      return new BadRequestException(
        `Received range is invalid: [${options?.range}]`,
      );
    case blmCreationFailure:
      return new InternalServerErrorException(
        `Could not create initial BLM for scenario.`,
      );
    case jobSubmissionFailed:
      return new InternalServerErrorException('Job submission failed.');
    case submissionFailed:
      return new InternalServerErrorException(
        'System could not submit the async job.',
      );
    case nullPlanningUnitGridShape:
      return new BadRequestException('Invalid planing unit grid shape.');
    case initialCostProjectNotFound:
      return new NotFoundException('Project not found.');
    case unknownPdfWebshotError:
      return new InternalServerErrorException(
        'Unexpected error while preparing scenario solutions report.',
      );
    default:
      const _exhaustiveCheck: never = errorToCheck;
      return _exhaustiveCheck;
  }
};
