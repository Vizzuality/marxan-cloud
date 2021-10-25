import { isDefined } from '@marxan/utils';
import { NonFunctionKeys } from 'utility-types';
import { PlanningGids } from './abstract-planning-areas.service';

type PlainGids = Pick<Gids, NonFunctionKeys<Gids>>;

export class Gids {
  constructor(
    public readonly gid0?: string | null,
    public readonly gid1?: string | null,
    public readonly gid2?: string | null,
  ) {}

  static fromGids(gids: PlainGids) {
    return new Gids(gids.gid0, gids.gid1, gids.gid2);
  }

  static fromInput(gid: PlanningGids) {
    return new Gids(
      gid.countryId,
      gid.adminAreaLevel1Id,
      gid.adminAreaLevel2Id,
    );
  }

  contains(other: Gids) {
    return (
      this.gid0 === other.gid0 &&
      (!isDefined(this.gid1) || this.gid1 === other.gid1) &&
      (!isDefined(this.gid2) || this.gid2 === other.gid2)
    );
  }
}
