import * as stream from 'stream';

export const FileNotFound = Symbol();

export const FileNotReady = Symbol();

export const FilePiped = Symbol();

export abstract class CostTemplateService {
  abstract scheduleShapefileCostTemplateCreation(scenarioId: string): void;

  abstract getShapefileCostTemplate(
    scenarioId: string,
    stream: stream.Writable,
  ): Promise<typeof FileNotFound | typeof FileNotReady | typeof FilePiped>;
}
