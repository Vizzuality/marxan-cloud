import { IEvent } from '@nestjs/cqrs';

/**
 * emitted as an end-step by aggregate once all pieces were imported
 */
export class AllPiecesImported implements IEvent {}
