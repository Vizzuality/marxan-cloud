import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ScenarioPlanningUnitsDataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-planning-units-data';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
  toLockEnum,
} from '@marxan/scenarios-planning-unit';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { chunk } from 'lodash';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class ScenarioPlanningUnitsDataPieceImporter
  implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioPlanningUnitsDataPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioPlanningUnitsData;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { projectId, pieceResourceId: scenarioId, uris, piece } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [scenarioPlanningUnitsDataLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      scenarioPlanningUnitsDataLocation.uri,
    );

    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioPlanningUnitsDataLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const buffer = await readableToBuffer(readableOrError.right);
    const stringScenarioPlanningUnitsDataOrError = buffer.toString();

    const { planningUnitsData }: ScenarioPlanningUnitsDataContent = JSON.parse(
      stringScenarioPlanningUnitsDataOrError,
    );
    const projectPuIdByPuid: Record<number, string> = {};

    await this.entityManager.transaction(async (em) => {
      const projectsPuRepo = em.getRepository(ProjectsPuEntity);
      const projectPus = await projectsPuRepo.find({
        select: ['id', 'puid'],
        where: { projectId },
      });
      projectPus.forEach((pu) => {
        projectPuIdByPuid[pu.puid] = pu.id;
      });

      const chunkSize = 1000;

      await Promise.all(
        chunk(planningUnitsData, chunkSize).map(async (pusData) => {
          const scenarioPuIdByPuid: Record<number, string> = {};

          await em.getRepository(ScenariosPuPaDataGeo).save(
            pusData.map((puData) => {
              const id = v4();
              scenarioPuIdByPuid[puData.puid] = id;
              return {
                id,
                featureList: puData.featureList,
                projectPuId: projectPuIdByPuid[puData.puid],
                lockStatus: toLockEnum[puData.lockinStatus ?? 0],
                protectedArea: puData.protectedArea,
                protectedByDefault: puData.protectedByDefault,
                xloc: puData.xloc,
                yloc: puData.yloc,
                scenarioId,
              };
            }),
          );

          await em.getRepository(ScenariosPuCostDataGeo).save(
            pusData.map((puData) => ({
              cost: puData.cost,
              scenariosPuDataId: scenarioPuIdByPuid[puData.puid],
            })),
          );
        }),
      );
    });

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
