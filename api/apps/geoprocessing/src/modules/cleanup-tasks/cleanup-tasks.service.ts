import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupTasksService {
  private readonly logger = new Logger(CleanupTasksService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  handleCron() {
    this.logger.debug(
      'Preparing to clean dangling geo data for projects/scenarios',
    );
  }
}
