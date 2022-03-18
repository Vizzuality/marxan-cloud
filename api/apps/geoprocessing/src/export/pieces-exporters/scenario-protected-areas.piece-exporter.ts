import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-protected-areas';
import { FileRepository } from '@marxan/files-repository';
import { isDefined } from '@marxan/utils';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface SelectScenarioResult {
  id: string;
  protectedAreasIds?: string[];
  wdpaThreshold?: number;
}

interface CustomProtectedArea {
  ewkb: Buffer;
  name: string;
}

interface WdpaProtectedArea {
  ewkb: Buffer;
  wdpaid: number;
}

type SelectWdpaResult = WdpaProtectedArea | CustomProtectedArea;

@Injectable()
@PieceExportProvider()
export class ScenarioProtectedAreasPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(ScenarioProtectedAreasPieceExporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioProtectedAreas;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const apiQb = this.apiEntityManager.createQueryBuilder();
    const [scenario]: [SelectScenarioResult] = await apiQb
      .select('id')
      .addSelect('protected_area_filter_by_ids', 'protectedAreasIds')
      .addSelect('wdpa_threshold', 'wdpaThreshold')
      .from('scenarios', 's')
      .where('s.id = :scenarioId', { scenarioId: input.resourceId })
      .execute();

    if (!scenario) {
      const errorMessage = `${ScenarioProtectedAreasPieceExporter.name} - Scenario ${input.resourceId} does not exist.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const geoQb = this.geoprocessingEntityManager.createQueryBuilder();
    const protectedAreas: SelectWdpaResult[] = scenario.protectedAreasIds
      ? await geoQb
          .select('wdpaid')
          .addSelect('ST_AsEWKB(the_geom)', 'ewkb')
          .addSelect('full_name', 'name')
          .from('wdpa', 'pa')
          .where('pa.id IN (:...paIds)', {
            paIds: scenario.protectedAreasIds,
          })
          .execute()
      : [];

    const wdpaProtectedAreas = protectedAreas
      .filter((pa): pa is WdpaProtectedArea =>
        isDefined((pa as WdpaProtectedArea).wdpaid),
      )
      .map((pa) => pa.wdpaid);

    const customProtectedAreas = protectedAreas
      .filter((pa): pa is CustomProtectedArea =>
        isDefined((pa as CustomProtectedArea).name),
      )
      .map((pa) => ({
        name: pa.name,
        geom: pa.ewkb.toJSON().data,
      }));

    const fileContent: ScenarioProtectedAreasContent = {
      threshold: scenario.wdpaThreshold,
      wdpa: wdpaProtectedAreas,
      customProtectedAreas,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioProtectedAreasPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioProtectedAreas,
        outputFile.right,
        {
          kind: input.resourceKind,
          scenarioId: input.resourceId,
        },
      ),
    };
  }
}
