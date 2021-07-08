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
    } else {
      const error = response.left;
      if (error === metadataNotFound) {
        throw new NotFoundException(`Marxan was not yet executed.`);
      } else if (error === outputZipNotYetAvailable) {
        throw new NotFoundException(
          `Marxan has not yet finished or finished with error.`,
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
