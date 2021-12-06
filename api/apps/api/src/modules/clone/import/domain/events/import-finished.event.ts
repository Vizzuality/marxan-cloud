import { IEvent } from '@nestjs/cqrs';

/**
 * not emitted by aggregate directly - may indicate that the cleanups were done
 */
export class ImportFinished implements IEvent {}
