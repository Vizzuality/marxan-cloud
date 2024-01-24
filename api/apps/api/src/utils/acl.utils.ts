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
  projectNotEditable,
  projectNotFound,
  projectNotFoundForExport,
  projectNotVisible,
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
import { submissionFailed } from '@marxan-api/modules/projects/protected-area/add-protected-area.service';
import { invalidProtectedAreaId } from '@marxan-api/modules/scenarios/protected-area/selection/selection-update.service';
import {
  bestSolutionNotFound,
  lockedSolutions,
  projectDoesntExist,
  projectNotReady,
  scenarioNotCreated,
  scenarioNotEditable,
} from '@marxan-api/modules/scenarios/scenarios.service';
import { internalError } from '@marxan-api/modules/specification/application/submit-specification.command';
import { notFound as protectedAreaProjectNotFound } from '@marxan/projects';
import { jobSubmissionFailed } from '@marxan/artifact-cache';
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
import {
  featureDataCannotBeUploadedWithCsv,
  featureNameAlreadyInUse,
  featureNotEditable,
  featureNotFound,
  importedFeatureNameAlreadyExist,
  missingPuidColumnInFeatureAmountCsvUpload,
  unknownPuidsInFeatureAmountCsvUpload,
} from '@marxan-api/modules/geo-features/geo-features.service';
import {
  duplicateHeadersInFeatureAmountCsvUpload,
  duplicatePuidsInFeatureAmountCsvUpload,
  noFeaturesFoundInInFeatureAmountCsvUpload,
} from '@marxan-api/modules/geo-features/import/csv.parser';
import {
  featureNotEditableByUserWithinProject,
  featureNotFoundWithinProject,
  tagNotFoundForProject,
} from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { outputProjectSummaryNotFound } from '@marxan-api/modules/projects/output-project-summaries/output-project-summaries.service';
import {
  customProtectedAreaIsUsedInOneOrMoreScenarios,
  customProtectedAreaNotDeletableByUser,
  customProtectedAreaNotEditableByUser,
  globalProtectedAreaNotDeletable,
  globalProtectedAreaNotEditable,
  protectedAreaNotFound,
} from '@marxan-api/modules/protected-areas/protected-areas-crud.service';
import {
  cannotDeleteDefaultCostSurface,
  costSurfaceNameAlreadyExistsForProject,
  costSurfaceNotFound,
  costSurfaceNotFoundForProject,
  costSurfaceStillInUse,
} from '@marxan-api/modules/cost-surface/cost-surface.service';
import { deleteCostSurfaceFailed } from '@marxan-api/modules/cost-surface/delete-cost-surface/delete-cost-surface.command';
import { linkCostSurfaceToScenarioFailed } from '@marxan-api/modules/cost-surface/application/scenario/link-cost-surface-to-scenario.command';

interface ErrorHandlerOptions {
  projectId?: string;
  featureId?: string;
  range?: [number, number];
  resourceType?: string;
  scenarioId?: string;
  userId?: string;
  exportId?: string;
  featureClassName?: string;
  costSurfaceId?: string;
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
    | typeof featureNameAlreadyInUse
    | typeof featureNotFound
    | typeof featureNotFoundWithinProject
    | typeof featureNotEditableByUserWithinProject
    | typeof featureNotEditable
    | typeof projectNotFound
    | typeof projectNotEditable
    | typeof projectNotVisible
    | typeof tagNotFoundForProject
    | typeof scenarioNotCreated
    | typeof importedFeatureNameAlreadyExist
    | typeof unknownPuidsInFeatureAmountCsvUpload
    | typeof missingPuidColumnInFeatureAmountCsvUpload
    | typeof duplicatePuidsInFeatureAmountCsvUpload
    | typeof duplicateHeadersInFeatureAmountCsvUpload
    | typeof noFeaturesFoundInInFeatureAmountCsvUpload
    | ImportProjectError
    | typeof featureDataCannotBeUploadedWithCsv
    | typeof outputProjectSummaryNotFound
    | typeof globalProtectedAreaNotEditable
    | typeof protectedAreaNotFound
    | typeof customProtectedAreaNotEditableByUser
    | typeof customProtectedAreaNotDeletableByUser
    | typeof customProtectedAreaIsUsedInOneOrMoreScenarios
    | typeof globalProtectedAreaNotDeletable
    | typeof costSurfaceNotFoundForProject
    | typeof costSurfaceNameAlreadyExistsForProject
    | typeof costSurfaceNotFound
    | typeof costSurfaceStillInUse
    | typeof cannotDeleteDefaultCostSurface
    | typeof deleteCostSurfaceFailed
    | typeof scenarioNotEditable
    | typeof linkCostSurfaceToScenarioFailed,
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
    case featureNameAlreadyInUse:
      throw new ForbiddenException(
        `Feature with id ${options?.featureId} cannot be updated: name is already in use (${options?.featureClassName})`,
      );
    case featureNotFound:
      throw new NotFoundException(
        `Feature with id ${options?.featureId} not found`,
      );
    case featureNotFoundWithinProject:
      throw new NotFoundException(
        `Feature with id ${options?.featureId} is not available within Project with id ${options?.projectId}`,
      );
    case featureNotEditableByUserWithinProject:
      throw new ForbiddenException(
        `Feature with id ${options?.featureId} is not editable by user ${options?.userId} within Project with id ${options?.projectId}`,
      );
    case featureNotEditable:
      throw new ForbiddenException(
        `Feature with id ${options?.featureId} is not editable`,
      );
    case projectNotEditable:
      throw new ForbiddenException(
        `Project with id ${options?.projectId} is not editable by user ${options?.userId}`,
      );
    case projectNotVisible:
      throw new ForbiddenException(
        `Project with id ${options?.projectId} cannot be consulted by user ${options?.userId}`,
      );
    case projectNotFound:
      throw new NotFoundException(
        `Project with id ${options?.projectId} not found`,
      );
    case tagNotFoundForProject:
      throw new NotFoundException(
        `Tag for Project with id ${options?.projectId} not found`,
      );
    case costSurfaceNotFoundForProject:
      throw new NotFoundException(
        `Cost Surface for Project with id ${options?.projectId} not found`,
      );
    case costSurfaceNotFound:
      throw new NotFoundException(
        `Cost Surface ${options?.costSurfaceId} not found`,
      );
    case costSurfaceNameAlreadyExistsForProject:
      throw new ForbiddenException(
        `Cost Surface with id ${options?.costSurfaceId} cannot be updated: name is already in use in the associated Project`,
      );
    case costSurfaceStillInUse:
      throw new ForbiddenException(
        `Cost Surface with id ${options?.costSurfaceId} cannot be deleted: it's still in use by Scenarios`,
      );
    case cannotDeleteDefaultCostSurface:
      throw new ForbiddenException(
        `Cost Surface with id ${options?.costSurfaceId} cannot be deleted: it's the Project's default`,
      );
    case deleteCostSurfaceFailed:
      return new BadRequestException(
        `Cost Surface ${options?.costSurfaceId} and associated resources could not be deleted.`,
      );
    case scenarioNotCreated:
      throw new NotFoundException(
        `Scenario for Project with id ${options?.projectId} could not be created`,
      );
    case importedFeatureNameAlreadyExist:
      return new BadRequestException('Imported Features already present');
    case unknownPuidsInFeatureAmountCsvUpload:
      return new BadRequestException('Unknown PUIDs');
    case missingPuidColumnInFeatureAmountCsvUpload:
      return new BadRequestException('Missing PUID column');
    case noFeaturesFoundInInFeatureAmountCsvUpload:
      return new BadRequestException(
        'No features found in feature amount CSV upload',
      );
    case duplicateHeadersInFeatureAmountCsvUpload:
      return new BadRequestException(
        'Duplicate headers in feature amount CSV upload',
      );
    case duplicatePuidsInFeatureAmountCsvUpload:
      return new BadRequestException(
        'Duplicate PUIDs in feature amount CSV upload',
      );
    case featureDataCannotBeUploadedWithCsv:
      throw new ForbiddenException(
        `User with id ${options?.userId} cannot upload feature data with csv for project with id ${options?.projectId}`,
      );
    case outputProjectSummaryNotFound:
      throw new NotFoundException(
        `Output Summary for Project with id: ${options?.projectId} not found`,
      );
    case globalProtectedAreaNotEditable:
      throw new ForbiddenException('Global protected areas are not editable.');
    case globalProtectedAreaNotDeletable:
      throw new ForbiddenException(
        'Global protected areas can not be deleted.',
      );
    case protectedAreaNotFound:
      throw new NotFoundException('Protected area not found.');
    case customProtectedAreaNotEditableByUser:
      throw new ForbiddenException(
        'User not allowed to edit protected areas of the project',
      );
    case customProtectedAreaNotDeletableByUser:
      throw new ForbiddenException(
        'User not allowed to delete protected areas of the project',
      );
    case customProtectedAreaIsUsedInOneOrMoreScenarios:
      throw new ForbiddenException(
        `Custom protected area is used in one or more scenarios cannot be deleted.`,
      );
    case scenarioNotEditable:
      throw new ForbiddenException(
        `Scenario with id ${options?.scenarioId} is not editable by the given user`,
      );
    case linkCostSurfaceToScenarioFailed:
      throw new BadRequestException(
        `Linking Cost Surface to Scenario ${options?.scenarioId} failed`,
      );

    default:
      const _exhaustiveCheck: never = errorToCheck;
      return _exhaustiveCheck;
  }
};
