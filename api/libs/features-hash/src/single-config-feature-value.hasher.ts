import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SingleConfigFeatureValue } from './single-config-feature-value';
import { SingleConfigFeatureValueStripped } from './single-config-feature-value.stripped';
import { StripSingleSplitConfigFeatureValue } from './strip-single-split-config-feature-value.service';

export const entityManagerToken = Symbol('entity manager token');

export type HashAndStrippedConfigFeature = {
  hash: string;
  canonical: SingleConfigFeatureValueStripped;
};

@Injectable()
export class SingleConfigFeatureValueHasher {
  constructor(
    @Inject(entityManagerToken)
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
