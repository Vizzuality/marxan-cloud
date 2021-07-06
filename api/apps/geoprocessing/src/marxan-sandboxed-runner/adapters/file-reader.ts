import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';

@Injectable()
export class FileReader {
  read(path: string): string {
    return readFileSync(path).toString();
  }
}
