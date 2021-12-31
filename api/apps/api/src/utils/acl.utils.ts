import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  forbiddenError,
  lastOwner,
  transactionFailed,
} from '@marxan-api/modules/access-control';

export const aclErrorHandler = (
  errorToCheck:
    | typeof forbiddenError
    | typeof lastOwner
    | typeof transactionFailed,
) => {
  switch (errorToCheck) {
    case forbiddenError:
      throw new ForbiddenException();
    case lastOwner:
      throw new ForbiddenException(`There must be at least one owner`);
    case transactionFailed:
      throw new InternalServerErrorException(`Transaction failed`);
    default:
      throw new InternalServerErrorException();
  }
};
