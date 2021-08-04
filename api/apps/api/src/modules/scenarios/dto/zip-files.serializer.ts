import { Injectable, NotFoundException } from '@nestjs/common';
import { Either, isRight } from 'fp-ts/Either';
import {
  marxanFailed,
  metadataNotFound as outputMetadataNotFound,
  OutputZipFailure,
  outputZipNotYetAvailable,
} from '../output-files/output-files.service';
import {
  InputZipFailure,
  inputZipNotYetAvailable,
  metadataNotFound,
} from '../input-files';

@Injectable()
export class ZipFilesSerializer {
  serialize(
    response: Either<OutputZipFailure | InputZipFailure, Buffer>,
  ): Buffer {
    if (isRight(response)) {
      return response.right;
    }
    const error = response.left;
    switch (error) {
      case metadataNotFound:
      case outputMetadataNotFound:
        throw new NotFoundException(`Marxan was not yet executed.`);
      case outputZipNotYetAvailable:
      case marxanFailed:
      case inputZipNotYetAvailable:
        throw new NotFoundException(
          `Marxan has not yet finished or finished with error.`,
        );
      default:
        const _exhaustiveCheck: never = error;
        throw _exhaustiveCheck;
    }
  }
}
