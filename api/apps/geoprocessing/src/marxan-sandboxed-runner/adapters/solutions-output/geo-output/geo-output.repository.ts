import { readFileSync } from 'fs';

import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';

import { Workspace } from '../../../ports/workspace';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { SolutionsReaderService } from './solutions/solutions-reader.service';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';

@Injectable()
export class GeoOutputRepository {
  constructor(
    @InjectRepository(MarxanExecutionMetadataGeoEntity)
    private readonly executionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity>,
    @InjectRepository(OutputScenariosPuDataGeoEntity)
    private readonly scenarioSolutionsOutputRepo: Repository<OutputScenariosPuDataGeoEntity>,
    private readonly metadataArchiver: MetadataArchiver,
    private readonly solutionsReader: SolutionsReaderService,
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

    const solutionMatrix =
      workspace.workingDirectory + `/output/output_solutionsmatrix.csv`;

    const rowsStream = await this.solutionsReader.from(solutionMatrix);

    return new Promise((resolve, reject) => {
      // TODO open transaction
      //  // delete output_scenarios_pu_data for given scenarioId
      //  // insert new rows from file

      rowsStream.on('data', async (data) => {
        //
        if (data.length === 0) {
          return;
        }

        // does not skip first batch of headers? (empty array)
        console.log(`--- save rows:`, data, data.length);
        try {
          this.scenarioSolutionsOutputRepo
            .save(
              data.map((row) => this.scenarioSolutionsOutputRepo.create(row)),
              {
                chunk: 10000,
              },
            )
            .then((res) => {
              console.log(`--- saved`, res.length);
            })
            .catch((error) => {
              console.log(`--- errors`, error);
            });
        } catch (er) {
          console.log(`--- why no return at all?`, er);
        }
      });

      rowsStream.on('error', reject);

      rowsStream.on('finish', async () => {
        //  // insert metadata

        await this.executionMetadataRepo.save(
          this.executionMetadataRepo.create({
            scenarioId,
            stdOutput: metaData.stdOutput.toString(),
            stdError: metaData.stdErr?.toString(),
            outputZip: readFileSync(outputArchivePath),
            inputZip: readFileSync(inputArchivePath),
          }),
        );
        resolve();
      });
    });
  }
}
