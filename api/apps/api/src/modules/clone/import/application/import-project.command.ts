import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { ExportId } from '../../export';
import { SaveError } from './import.repository.port';

export const exportNotFound = Symbol('export not found');
export const unfinishedExport = Symbol('unfinished export');
export const invalidProjectExport = Symbol('invalid project export');

export type ImportProjectError =
  | SaveError
  | typeof exportNotFound
  | typeof unfinishedExport
  | typeof invalidProjectExport;

export type ImportProjectCommandResult = {
  importId: string;
  projectId: string;
};

export class ImportProject extends Command<
  Either<ImportProjectError, ImportProjectCommandResult>
> {
  constructor(
    public readonly exportId: ExportId,
    public readonly ownerId: UserId,
  ) {
    super();
  }
}
