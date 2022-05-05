import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { ExportId } from '../../export';
import {
  exportNotFound,
  unfinishedExport,
} from '../../export/application/get-archive.query';
import { SaveError } from './import.repository.port';

export const scenarioShellNotFound = Symbol('scenario shell not found');
export const invalidScenarioExport = Symbol('invalid scenario export');

export type ImportScenarioError =
  | SaveError
  | typeof exportNotFound
  | typeof unfinishedExport
  | typeof invalidScenarioExport
  | typeof scenarioShellNotFound;

export type ImportScenarioCommandResult = {
  importId: string;
  scenarioId: string;
};

export class ImportScenario extends Command<
  Either<ImportScenarioError, ImportScenarioCommandResult>
> {
  constructor(
    public readonly exportId: ExportId,
    public readonly ownerId: UserId,
  ) {
    super();
  }
}
