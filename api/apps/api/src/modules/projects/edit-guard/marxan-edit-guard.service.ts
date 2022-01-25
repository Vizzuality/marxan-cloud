import { EditGuard } from '@marxan-api/modules/projects/edit-guard/edit-guard.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isLeft, isRight } from 'fp-ts/Either';

@Injectable()
export class MarxanEditGuard implements EditGuard {
  constructor(private readonly projectChecker: ProjectChecker) {}

  async ensureEditingIsAllowedFor(projectId: string): Promise<void> {
    const editIsBlocked = await this.projectChecker.hasPendingExports(
      projectId,
    );

    if (isLeft(editIsBlocked)) {
      throw new NotFoundException(
        `Could not find project with ID: ${projectId}`,
      );
    }

    if (isRight(editIsBlocked) && editIsBlocked.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending export`,
      );
  }
}
