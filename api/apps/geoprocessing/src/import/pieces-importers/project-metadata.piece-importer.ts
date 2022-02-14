import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import {
  PieceImportProvider,
  ImportPieceProcessor,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class ProjectMetadataPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ProjectMetadata;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    throw new Error('Missing implementation');
  }
}
