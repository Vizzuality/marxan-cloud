import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Either, isRight } from 'fp-ts/Either';
import {
  metadataNotFound,
  outputZipNotYetAvailable,
  OutputZipFailure,
} from '../output-files/output-files.service';

@Injectable()
export class ZipFilesSerializer {
  serialize(response: Either<OutputZipFailure, Buffer>): Buffer {
    if (isRight(response)) {
      return response.right;
    }
    const error = response.left;
    switch (error) {
      case metadataNotFound:
        throw new NotFoundException(`Marxan was not yet executed.`);
      case outputZipNotYetAvailable:
        throw new NotFoundException(
          `Marxan has not yet finished or finished with error.`,
        );
      default:
        const _exhaustiveCheck: never = error;
        throw _exhaustiveCheck;
    }
  }
}
