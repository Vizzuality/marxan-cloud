import { Injectable } from '@nestjs/common';
import { RunHandler } from './run.handler';
import { CancelHandler } from './cancel.handler';
import { EventsHandler } from './events.handler';

@Injectable()
export class RunService {
  constructor(
    private readonly runHandler: RunHandler,
    private readonly cancelHandler: CancelHandler,
    private readonly _eventsHandler: EventsHandler,
  ) {}

  run = this.runHandler.run.bind(this.runHandler);
  cancel = this.cancelHandler.cancel.bind(this.cancelHandler);
}
