import { Injectable } from '@nestjs/common';
import { FeatureMetadata, GetFeatureMetadata } from '../../application';

@Injectable()
export class TypeormGetFeatureMetadata implements GetFeatureMetadata {
  // TODO there will be all TypeOrm stuff
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolve(scenarioId: string): Promise<FeatureMetadata[]> {
    return [
      {
        tag: 'feature-tag',
        name: `feature-name/alias`,
        id: 'feature-id',
      },
    ];
  }
}
