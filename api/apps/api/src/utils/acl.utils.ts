import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  forbiddenError,
  lastOwner,
  transactionFailed,
  queryFailed,
} from '@marxan-api/modules/access-control';

export const aclErrorHandler = (
  errorToCheck:
    | typeof forbiddenError
    | typeof lastOwner
    | typeof transactionFailed
    | typeof queryFailed,
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
    default:
      throw new InternalServerErrorException();
  }
};
