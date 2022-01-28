import { Command } from '@nestjs-architects/typed-cqrs';
import { ResourceId } from '@marxan/cloning/domain';
import { ExportId } from '../domain';

export { ExportId };
export { ResourceId };

export class ExportScenario extends Command<ExportId> {
  constructor(public readonly id: ResourceId) {
    super();
  }
}
