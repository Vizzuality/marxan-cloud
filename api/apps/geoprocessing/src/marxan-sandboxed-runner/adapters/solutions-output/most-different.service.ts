import { Injectable } from '@nestjs/common';
import { ResultRow } from '@marxan/marxan-output';

@Injectable()
export class MostDifferentService {
  map(fromState: ResultRow[]): ResultRow[] {
    return fromState;
  }
}
