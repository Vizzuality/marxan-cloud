import { DbConnections } from '@marxan-api/ormconfig.connections';
import { StripSingleSplitConfigFeatureValue } from '@marxan-api/modules/features-hash/strip-single-split-config-feature-value.service';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  SingleConfigFeatureValue,
  SingleConfigFeatureValueStripped,
} from '@marxan/features-hash';

export type HashAndStrippedConfigFeature = {
  hash: string;
  canonical: SingleConfigFeatureValueStripped;
};

@Injectable()
export class SingleConfigFeatureValueHasher {
  constructor(
    @InjectEntityManager(DbConnections.default)
    private readonly entityManger: EntityManager,
    private readonly stripSplitConfigFeature: StripSingleSplitConfigFeatureValue,
  ) {}

  async getHashAndStrippedConfigFeature(
    input: SingleConfigFeatureValue,
  ): Promise<HashAndStrippedConfigFeature> {
    const stripped = this.stripSplitConfigFeature.execute(input);

    const [{ hash, canonical }]: [
      { hash: Buffer; canonical: SingleConfigFeatureValueStripped },
    ] = await this.entityManger.query(
      `
        SELECT (digest($1::jsonb::text, 'sha256')) as hash, $1::jsonb as canonical
    `,
      [stripped],
    );

    return { hash: '\\x' + hash.toString('hex'), canonical };
  }
}
