import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ScenarioPlanningUnitsDataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-planning-units-data';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
  toLockEnum,
} from '@marxan/scenarios-planning-unit';
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

    const stringScenarioPlanningUnitsDataOrError = await extractFile(
      readableOrError.right,
      scenarioPlanningUnitsDataLocation.relativePath,
    );
    if (isLeft(stringScenarioPlanningUnitsDataOrError)) {
      const errorMessage = `Scenario planning units data file extraction failed: ${scenarioPlanningUnitsDataLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { planningUnitsData }: ScenarioPlanningUnitsDataContent = JSON.parse(
      stringScenarioPlanningUnitsDataOrError.right,
    );

    await this.entityManager.transaction(async (em) => {
      const projectPuIdByPuid: Record<number, string> = {};
      const projectPus = await em
        .getRepository(ProjectsPuEntity)
        .find({ projectId });
      projectPus.forEach((pu) => {
        projectPuIdByPuid[pu.puid] = pu.id;
      });

      await em.getRepository(ScenariosPuPaDataGeo).save(
        planningUnitsData.map((puData) => ({
          featureList: puData.featureList,
          projectPuId: projectPuIdByPuid[puData.puid],
          lockStatus: toLockEnum[puData.lockinStatus ?? 0],
          protectedArea: puData.protectedArea,
          protectedByDefault: puData.protectedByDefault,
          xloc: puData.xloc,
          yloc: puData.yloc,
          scenarioId,
        })),
      );

      const scenarioPus = await em.getRepository(ScenariosPuPaDataGeo).find({
        where: {
          scenarioId,
        },
        relations: ['projectPu'],
      });
      const scenarioPuIdByPuid: Record<number, string> = {};
      scenarioPus.forEach((pu) => {
        scenarioPuIdByPuid[pu.projectPu.puid] = pu.id;
      });

      await em.getRepository(ScenariosPuCostDataGeo).save(
        planningUnitsData.map((puData) => ({
          cost: puData.cost,
          scenariosPuDataId: scenarioPuIdByPuid[puData.puid],
        })),
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
