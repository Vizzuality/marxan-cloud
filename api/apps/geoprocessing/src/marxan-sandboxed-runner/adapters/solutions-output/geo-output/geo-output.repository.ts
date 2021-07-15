import { readFileSync } from 'fs';

import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';

import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';

import { Workspace } from '../../../ports/workspace';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { SolutionsReaderService } from './solutions/solutions-reader.service';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

@Injectable()
export class GeoOutputRepository {
  constructor(
    private readonly metadataArchiver: MetadataArchiver,
    private readonly solutionsReader: SolutionsReaderService,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
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

    const rowsStream = await this.solutionsReader.from(
      solutionMatrix,
      scenarioId,
    );
    return this.entityManager.transaction((transaction) => {
      return new Promise(async (resolve, reject) => {
        const onFinish = async () => {
          await transaction.save(
            transaction.create(MarxanExecutionMetadataGeoEntity, {
              scenarioId,
              stdOutput: metaData.stdOutput.toString(),
              stdError: metaData.stdErr?.toString(),
              outputZip: readFileSync(outputArchivePath),
              inputZip: readFileSync(inputArchivePath),
            }),
          );
          resolve();
        };

        let streamFinished = false;
        let count = 0;
        let finishedCount = 0;

        rowsStream.on('data', async (data) => {
          if (data.length === 0) {
            return;
          }

          try {
            count += 1;
            for (const r of data) {
              await transaction.query(
                `
insert into output_scenarios_pu_data (value, scenario_pu_id, run_id)
values (${r.value},'${r.spdId}', ${r.runId})`,
              );
            }
            finishedCount += 1;

            if (count === finishedCount && streamFinished) {
              onFinish();
            }
          } catch (error) {
            reject(error);
          }
        });

        rowsStream.on('error', (error) => {
          reject(error);
        });

        rowsStream.on('finish', async () => {
          streamFinished = true;

          if (count === finishedCount) {
            await onFinish();
          }
        });
      });
    });
  }
}
