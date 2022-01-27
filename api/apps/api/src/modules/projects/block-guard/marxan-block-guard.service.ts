import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isLeft } from 'fp-ts/Either';

@Injectable()
export class MarxanBlockGuard implements BlockGuard {
  constructor(private readonly projectChecker: ProjectChecker) {}

  async ensureThatProjectIsNotBlocked(projectId: string): Promise<void> {
    const [
      hasPendingExports,
      hasPendingBlmCalibration,
      hasPendingMarxanRun,
    ] = await Promise.all([
      this.projectChecker.hasPendingExports(projectId),
      this.projectChecker.hasPendingBlmCalibration(projectId),
      this.projectChecker.hasPendingMarxanRun(projectId),
    ]);

    if (
      isLeft(hasPendingExports) ||
      isLeft(hasPendingBlmCalibration) ||
      isLeft(hasPendingMarxanRun)
    ) {
      throw new NotFoundException(
        `Could not find project with ID: ${projectId}`,
      );
    }

    if (hasPendingExports.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending export`,
      );

    if (hasPendingBlmCalibration.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending blm calibration`,
      );

    if (hasPendingMarxanRun.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending marxan run`,
      );
  }
}
