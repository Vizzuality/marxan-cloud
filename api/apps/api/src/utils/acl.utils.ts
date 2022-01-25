import {
  BadRequestException,
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
import { notFound } from '@marxan-api/modules/scenarios/marxan-run';

export const aclErrorHandler = (
  errorToCheck:
    | typeof forbiddenError
    | typeof lastOwner
    | typeof transactionFailed
    | typeof queryFailed
    | typeof notFound,
) => {
  switch (errorToCheck) {
    case forbiddenError:
      throw new ForbiddenException();
    case lastOwner:
      throw new ForbiddenException(`There must be at least one owner`);
    case queryFailed:
      throw new BadRequestException(
        `Error while adding record to the database`,
      );
    case transactionFailed:
      throw new InternalServerErrorException(`Transaction failed`);
    case notFound:
      throw new NotFoundException(`Entity not found`);
    default:
      const _check: never = errorToCheck;
      throw _check;
  }
};
