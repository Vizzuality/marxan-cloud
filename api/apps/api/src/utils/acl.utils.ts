import {
  forbiddenError,
  lastOwner,
  queryFailed,
  transactionFailed,
} from '@marxan-api/modules/access-control';
import {
  lockedByAnotherUser,
  lockedScenario,
  noLockInPlace,
  unknownError as lockUnknownError,
} from '@marxan-api/modules/access-control/scenarios-acl/locks/lock.service';
import {
  GetScenarioFailure,
  scenarioNotFound,
  unknownError as blmUnknownError,
  unknownError,
} from '@marxan-api/modules/blm/values/blm-repos';
import {
  exportIsNotStandalone,
  exportResourceKindIsNotProject,
  projectIsMissingInfoForRegularPus,
  projectIsNotPublished,
  projectNotFoundForExport,
} from '@marxan-api/modules/projects/projects.service';
import { notFound as notFoundSpec } from '@marxan-api/modules/scenario-specification/application/last-updated-specification.query';
import {
  invalidRange,
  unknownError as rangeUnknownError,
  updateFailure,
} from '@marxan-api/modules/scenarios/blm-calibration/change-scenario-blm-range.command';
import { blmCreationFailure } from '@marxan-api/modules/scenarios/blm-calibration/create-initial-scenario-blm.command';
import { deleteScenarioFailed } from '@marxan-api/modules/scenarios/delete-scenario/delete-scenario.command';
import {
  inputZipNotYetAvailable,
  metadataNotFound as inputMetadataNotFound,
} from '@marxan-api/modules/scenarios/input-files';
import { notFound as marxanRunNotFound } from '@marxan-api/modules/scenarios/marxan-run';
import {
  marxanFailed,
  metadataNotFound,
  outputZipNotYetAvailable,
} from '@marxan-api/modules/scenarios/output-files/output-files.service';
import { submissionFailed } from '@marxan-api/modules/scenarios/protected-area';
import { invalidProtectedAreaId } from '@marxan-api/modules/scenarios/protected-area/selection/selection-update.service';
import {
  bestSolutionNotFound,
  projectDoesntExist,
  projectNotReady,
  lockedSolutions,
} from '@marxan-api/modules/scenarios/scenarios.service';
import { internalError } from '@marxan-api/modules/specification/application/submit-specification.command';
import { notFound as protectedAreaProjectNotFound } from '@marxan/projects';
import { jobSubmissionFailed } from '@marxan/scenario-cost-surface';
import {
  unknownPdfWebshotError,
  unknownPngWebshotError,
} from '@marxan/webshot';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  exportNotFound,
  unfinishedExport,
} from '../modules/clone/export/application/get-archive.query';
import {
  ImportProjectError,
  invalidProjectExport,
} from '../modules/clone/import/application/import-project.command';
import { saveError } from '../modules/clone/import/application/import.repository.port';
import {
  AclErrors,
  userNotFound,
} from '@marxan-api/modules/access-control/access-control.types';

interface ErrorHandlerOptions {
  projectId?: string;
  range?: [number, number];
  resourceType?: string;
  scenarioId?: string;
  userId?: string;
  exportId?: string;
}

export const mapAclDomainToHttpError = (
  errorToCheck:
    | AclErrors
    | GetScenarioFailure
    | typeof lockedSolutions
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
    | typeof bestSolutionNotFound
    | typeof unknownPdfWebshotError
    | typeof unknownPngWebshotError
    | typeof unknownError
    | typeof userNotFound
    | typeof exportNotFound
    | typeof exportResourceKindIsNotProject
    | typeof exportIsNotStandalone
    | typeof projectNotFoundForExport
    | typeof projectIsNotPublished
    | typeof deleteScenarioFailed
    | ImportProjectError
    | GetScenarioFailure,
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

    case exportNotFound:
      return new NotFoundException(
        `Could not find export with ID: ${options?.exportId}`,
      );
    case unfinishedExport:
      return new HttpException(
        `Export with ID ${options?.exportId} hasn't finished`,
        423,
      );
    case invalidProjectExport:
      return new BadRequestException(
        `Export with ID ${options?.exportId} isn't a valid project export`,
      );
    case saveError:
      return new InternalServerErrorException('Error while saving import');
    case exportResourceKindIsNotProject:
      return new BadRequestException(
        `Export with ID ${options?.exportId} is not a project export`,
      );
    case exportIsNotStandalone:
      return new BadRequestException(
        `Export with ID ${options?.exportId} is not a standalone export`,
      );
    case projectNotFoundForExport:
      return new NotFoundException(
        `Project not found for export with ID ${options?.exportId}`,
      );
    case projectIsNotPublished:
      return new ForbiddenException(
        `Trying to clone project export with ID ${options?.exportId} which is not a published project`,
      );
    case lockedSolutions:
      return new BadRequestException(
        `Scenario ${options?.scenarioId} solutions are locked.`,
      );
    case deleteScenarioFailed:
      return new BadRequestException(
        `Scenario ${options?.scenarioId} and associated resources could not be deleted.`,
      );
    default:
      const _exhaustiveCheck: never = errorToCheck;
      return _exhaustiveCheck;
  }
};
