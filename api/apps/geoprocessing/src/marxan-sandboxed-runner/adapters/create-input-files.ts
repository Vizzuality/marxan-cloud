import { Injectable } from '@nestjs/common';
import { InputFiles } from '../ports/input-files';

@Injectable()
export class CreateInputFiles implements InputFiles {
  async include(_values: unknown, _directory: string): Promise<void> {
    // TODO
    return;
  }
}
