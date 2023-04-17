import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ResourceKind } from '@marxan/cloning/domain';
import { ProjectCustomProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-protected-areas';
import { ProtectedArea } from '@marxan/protected-areas';
import { readableToBuffer } from '@marxan/utils';
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
export class ProjectCustomProtectedAreasPieceImporter
  implements ImportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ProjectCustomProtectedAreasPieceImporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectCustomProtectedAreas &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, pieceResourceId, projectId, piece } = input;

    try {
      if (uris.length !== 1) {
        const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      const [customProjectProtectedAreasLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        customProjectProtectedAreasLocation.uri,
      );
      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${customProjectProtectedAreasLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const customProjectProtectedAreasrError = buffer.toString();

      const customProjectProtectedAreas: ProjectCustomProtectedAreasContent[] = JSON.parse(
        customProjectProtectedAreasrError,
      );

      if (customProjectProtectedAreas.length) {
        await this.geoprocessingEntityManager.transaction(async (em) => {
          const insertValues = customProjectProtectedAreas.map(
            (protectedArea) =>
              this.parseCustomProjectProtectedAreas(protectedArea, projectId),
          );
          await em
            .createQueryBuilder()
            .insert()
            .into(ProtectedArea)
            .values(insertValues)
            .execute();
        });
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId,
      projectId,
      piece: input.piece,
    };
  }

  private parseCustomProjectProtectedAreas(
    customProtecteArea: ProjectCustomProtectedAreasContent,
    projectId: string,
  ) {
    const buffer = Buffer.from(customProtecteArea.ewkb).toString('hex');
    return {
      projectId,
      fullName: customProtecteArea.fullName,
      theGeom: () => `'${buffer}'`,
    };
  }
}
