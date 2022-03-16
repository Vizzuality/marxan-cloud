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
  queryFailed,
  transactionFailed,
} from '@marxan-api/modules/access-control';
import { notFound as marxanRunNotFound } from '@marxan-api/modules/scenarios/marxan-run';
import {
  GetScenarioFailure,
  scenarioNotFound,
  unknownError,
  unknownError as blmUnknownError,
} from '@marxan-api/modules/blm/values/blm-repos';
import {
  bestSolutionNotFound,
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
  lockedByAnotherUser,
  lockedScenario,
  noLockInPlace,
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
  unknownError as rangeUnknownError,
  updateFailure,
} from '@marxan-api/modules/scenarios/blm-calibration/change-scenario-blm-range.command';
import {
  AclErrors,
  userNotFound,
} from '@marxan-api/modules/access-control/access-control.types';
import {
  unknownPdfWebshotError,
  unknownPngWebshotError,
} from '@marxan/webshot';
import { notFound as notFoundSpec } from '@marxan-api/modules/scenario-specification/application/last-updated-specification.query';
import { projectIsMissingInfoForRegularPus } from '@marxan-api/modules/projects/projects.service';

interface ErrorHandlerOptions {
  projectId?: string;
  range?: [number, number];
  resourceType?: string;
  scenarioId?: string;
  userId?: string;
}

export const mapAclDomainToHttpError = (
  errorToCheck:
    | AclErrors
    | GetScenarioFailure
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
    | typeof notFoundSpec
    | typeof invalidProtectedAreaId
    | typeof projectNotReady
    | typeof projectDoesntExist
    | typeof projectIsMissingInfoForRegularPus
    | typeof protectedAreaProjectNotFound
    | typeof invalidRange
    | typeof updateFailure
    | typeof rangeUnknownError
    | typeof blmCreationFailure
    | typeof jobSubmissionFailed
    | typeof submissionFailed
    | typeof nullPlanningUnitGridShape
    | typeof initialCostProjectNotFound
    | typeof bestSolutionNotFound
    | typeof unknownPdfWebshotError
    | typeof unknownPngWebshotError
    | typeof unknownError
    | typeof userNotFound
    | typeof unknownPngWebshotError,
  options?: ErrorHandlerOptions,
) => {
  switch (errorToCheck) {
    case userNotFound:
      return new NotFoundException(
        `User with ID: ${options?.userId} could not be found.`,
      );
    case unknownError:
      return new InternalServerErrorException(options);
    case forbiddenError:
      return new ForbiddenException(
        `User with ID: ${options?.userId} is not allowed to perform this action on ${options?.resourceType}.`,
      );
    case projectIsMissingInfoForRegularPus:
      return new BadRequestException(
        `When a regular planning grid is requested (hexagon or square) either a custom planning area or a GADM area gid must be provided`,
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
        'Unexpected error while preparing PDF snapshot via webshot.',
      );
    case unknownPngWebshotError:
      return new InternalServerErrorException(
        'Unexpected error while preparing PNG snapshot via webshot.',
      );
    case bestSolutionNotFound:
      return new NotFoundException(
        `Could not find best solution for scenario with ID: ${options?.scenarioId}.`,
      );
    case notFoundSpec:
      return new NotFoundException(
        `Could not find spec for scenario with ID: ${options?.scenarioId}.`,
      );
    default:
      const _exhaustiveCheck: never = errorToCheck;
      return _exhaustiveCheck;
  }
};
