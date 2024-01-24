import {
  LegacyProjectImportChecker,
  LegacyProjectImportDoesntExist,
  legacyProjectImportDoesntExist,
} from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import-checker/legacy-project-import-checker.service';
import { LegacyProjectImportRepository } from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { ResourceId } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';

@Injectable()
export class LegacyProjectImportCheckerFake
  implements LegacyProjectImportChecker
{
  private legacyProjectImportWithPendingImports: string[] = [];

  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
  ) {}

  async isLegacyProjectImportCompletedFor(
    projectId: string,
  ): Promise<Either<LegacyProjectImportDoesntExist, boolean>> {
    const legacyProjectImport = await this.legacyProjectImportRepo.find(
      new ResourceId(projectId),
    );
    if (!legacyProjectImport) return left(legacyProjectImportDoesntExist);

    return right(
      !this.legacyProjectImportWithPendingImports.includes(projectId),
    );
  }

  addPendingLegacyProjecImport(projectId: string) {
    this.legacyProjectImportWithPendingImports.push(projectId);
  }

  clear() {
    this.legacyProjectImportWithPendingImports = [];
  }
}
