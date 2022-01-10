import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { isLeft } from 'fp-ts/Either';

import { Facade } from './facade';
import { notReachable, timeout } from './third-party-service';
import { forbidden, invalidEmail, unknownError } from './legacy-service';

class SomeDto {}

@Injectable()
export class Serializer {
  map(result: PromiseType<ReturnType<Facade['doComposedAction']>>): SomeDto {
    if (isLeft(result)) {
      switch (result.left) {
        case notReachable:
          throw new InternalServerErrorException(
            `Not reachable, contact with admins`,
          );
        case timeout:
          throw new InternalServerErrorException(
            `We couldn't contact external service to fulfill request. Please try again.`,
          );
        case forbidden:
          throw new ForbiddenException();
        case invalidEmail:
          throw new BadRequestException(`invalid email`);
        case unknownError:
          throw new InternalServerErrorException(
            `We did something wrong... our developers are investigating!`,
          );
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return {};
  }
}
