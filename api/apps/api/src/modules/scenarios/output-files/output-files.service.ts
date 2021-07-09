import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Either, left, right } from 'fp-ts/Either';

export const metadataNotFound = Symbol(
  `marxan output file - metadata not found`,
);
export const outputZipNotYetAvailable = Symbol(
  `marxan output file - output file not available, possibly error`,
);

export type OutputZipFailure =
  | typeof metadataNotFound
  | typeof outputZipNotYetAvailable;

@Injectable()
export class OutputFilesService {
  constructor(
    @InjectRepository(
      MarxanExecutionMetadataGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly executionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity>,
  ) {}

  async get(scenarioId: string): Promise<Either<OutputZipFailure, Buffer>> {
    const latest = await this.executionMetadataRepo.findOne({
      where: {
        scenarioId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!latest) {
      return left(metadataNotFound);
    }
    if (!latest.outputZip) {
      return left(outputZipNotYetAvailable);
    }
    return right(latest.outputZip);
  }
}
