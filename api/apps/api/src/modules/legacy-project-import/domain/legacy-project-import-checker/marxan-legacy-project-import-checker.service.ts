import { ResourceId } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { LegacyProjectImportRepository } from '../legacy-project-import/legacy-project-import.repository';
import {
  legacyProjectImportDoesntExist,
  LegacyProjectImportChecker,
  LegacyProjectImportDoesntExist,
} from './legacy-project-import-checker.service';

@Injectable()
export class MarxanLegacyProjectImportChecker
  implements LegacyProjectImportChecker {
  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
  ) {}
  async hasImportedLegacyProjectImport(
    projectId: string,
  ): Promise<Either<LegacyProjectImportDoesntExist, boolean>> {
    const legacyProjectImport = await this.legacyProjectImportRepo.find(
      new ResourceId(projectId),
    );

    if (isLeft(legacyProjectImport))
      return left(legacyProjectImportDoesntExist);

    return right(legacyProjectImport.right.hasImportedLegacyProject());
  }
}
