import { BadRequestException, Injectable } from '@nestjs/common';
import { EditGuard } from '@marxan-api/modules/projects/edit-guard/edit-guard.service';
import { isLeft } from 'fp-ts/Either';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';

@Injectable()
export class MarxanEditGuard implements EditGuard {
  constructor(private readonly projectChecker: ProjectChecker) {}

  async ensureEditingIsAllowedFor(projectId: string): Promise<void> {
    const editIsBlocked = await this.projectChecker.hasPendingExports(
      projectId,
    );

    if (isLeft(editIsBlocked))
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending export`,
      );
  }
}
