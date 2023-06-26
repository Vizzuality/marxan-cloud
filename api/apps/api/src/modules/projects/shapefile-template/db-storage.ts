import { Storage } from './storage';
import { Injectable } from '@nestjs/common';
import * as stream from 'stream';
import {
  ArtifactType,
  CacheNotFound,
  ErrorWithSymbol,
  ScenarioCostSurfaceRepository,
} from '@marxan/scenario-cost-surface';

@Injectable()
export class DbStorage extends Storage {
  constructor(
    private readonly scenarioCostSurfaceRepository: ScenarioCostSurfaceRepository,
  ) {
    super();
  }

  getStream(projectId: string): Promise<stream.Readable | undefined> {
    return new Promise((resolve, reject) => {
      const passThrough = new stream.PassThrough();
      passThrough
        .on(`error`, (error) => {
          if (
            error instanceof ErrorWithSymbol &&
            error.errorSymbol === CacheNotFound
          ) {
            resolve(undefined);
            return;
          }
          reject(error);
        })
        .on(`pipe`, () => {
          resolve(passThrough);
        });
      this.scenarioCostSurfaceRepository
        .read(projectId, ArtifactType.CostTemplate, passThrough)
        .catch(reject);
    });
  }
}
