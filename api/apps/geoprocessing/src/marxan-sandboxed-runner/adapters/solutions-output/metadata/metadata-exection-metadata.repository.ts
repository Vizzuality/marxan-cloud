import { readFileSync } from 'fs';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';

import { Workspace } from '../../../ports/workspace';
import { MetadataArchiver } from './data-archiver.service';

@Injectable()
export class MarxanExecutionMetadataRepository {
  constructor(
    @InjectRepository(MarxanExecutionMetadataGeoEntity)
    private readonly executionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity>,
    private readonly metadataArchiver: MetadataArchiver,
  ) {}

  async save(
    scenarioId: string,
    workspace: Workspace,
    metaData: {
      stdOutput: string[];
      stdErr?: string[];
    },
  ): Promise<void> {
    const inputArchivePath = await this.metadataArchiver.zipInput(workspace);
    const outputArchivePath = await this.metadataArchiver.zipOutput(workspace);

    await this.executionMetadataRepo.save(
      this.executionMetadataRepo.create({
        scenarioId,
        stdOutput: metaData.stdOutput.toString(),
        stdError: metaData.stdErr?.toString(),
        outputZip: readFileSync(outputArchivePath),
        inputZip: readFileSync(inputArchivePath),
      }),
    );
  }
}
