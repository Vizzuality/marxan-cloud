import { Injectable } from '@nestjs/common';
import * as slug from 'slug';

@Injectable()
export class SlugService {
  stringToSlug(string: string): string {
    return slug(string);
  }
}
