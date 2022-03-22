import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ScenarioProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-protected-areas';
import { FileRepository } from '@marxan/files-repository';
import { ProtectedArea } from '@marxan/protected-areas';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class ScenarioProtectedAreasPieceImporter
  implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioProtectedAreasPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioProtectedAreas;
  }

  async getWdpaProtectedAreasIds(wdpa: number[]): Promise<string[]> {
    if (wdpa.length === 0) return [];

    const wdpaProtectedAreas: {
      id: string;
      wdpaid: number;
    }[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('id')
      .addSelect('wdpaid')
      .from(ProtectedArea, 'pa')
      .where('wdpaid IN (:...wdpaIds)', { wdpaIds: wdpa })
      .execute();

    if (wdpaProtectedAreas.length !== wdpa.length) {
      const wdpaProtectedAreasIds = wdpaProtectedAreas.map((pa) => pa.wdpaid);
      const notFoundIds = wdpa.filter(
        (id) => !wdpaProtectedAreasIds.includes(id),
      );
      const errorMessage = `WDPA protected areas not found: ${notFoundIds}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return wdpaProtectedAreas.map((pa) => pa.id);
  }

  async getCustomProtectedAreasIds(
    customProtectedAreas: ScenarioProtectedAreasContent['customProtectedAreas'],
    projectId: string,
  ): Promise<string[]> {
    if (customProtectedAreas.length === 0) return [];

    const qb = this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('id')
      .from(ProtectedArea, 'pa')
      .where('project_id = :projectId', { projectId });

    return Promise.all(
      customProtectedAreas.map((customPa) => {
        return new Promise<string>(async (resolve, reject) => {
          const [protectedArea]: [{ id: string }] = await qb
            .andWhere('ST_Equals(the_geom, :geom)', {
              geom: Buffer.from(customPa.geom),
            })
            .execute();

          if (protectedArea) resolve(protectedArea.id);

          reject(new Error(`${customPa.name} custom protected area not found`));
        });
      }),
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const {
      importResourceId: projectId,
      componentResourceId: scenarioId,
      uris,
      piece,
    } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [scenarioProtectedAreasLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      scenarioProtectedAreasLocation.uri,
    );

    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioProtectedAreasLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const stringScenarioProtectedAreasOrError = await extractFile(
      readableOrError.right,
      scenarioProtectedAreasLocation.relativePath,
    );
    if (isLeft(stringScenarioProtectedAreasOrError)) {
      const errorMessage = `Scenario protected areas file extraction failed: ${scenarioProtectedAreasLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const {
      threshold,
      wdpa,
      customProtectedAreas,
    }: ScenarioProtectedAreasContent = JSON.parse(
      stringScenarioProtectedAreasOrError.right,
    );
    const protectedAreasIds: string[] = [];

    const wdpaProtectedAreasIds = await this.getWdpaProtectedAreasIds(wdpa);
    const customProtectedAreasIds = await this.getCustomProtectedAreasIds(
      customProtectedAreas,
      projectId,
    );

    protectedAreasIds.push(...wdpaProtectedAreasIds);
    protectedAreasIds.push(...customProtectedAreasIds);

    await this.apiEntityManager
      .createQueryBuilder()
      .update('scenarios')
      .set({
        protected_area_filter_by_ids: JSON.stringify(protectedAreasIds),
        wdpa_threshold: threshold,
      })
      .where('id = :scenarioId', { scenarioId })
      .execute();

    return {
      importId: input.importId,
      componentId: input.componentId,
      importResourceId: input.importResourceId,
      componentResourceId: input.componentResourceId,
      piece: input.piece,
    };
  }
}
