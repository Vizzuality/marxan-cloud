import * as stream from 'stream';

export const FileNotFound = Symbol();

export const FileNotReady = Symbol();

export const FilePiped = Symbol();

export abstract class ScenarioCostSurfaceTemplateService {
  abstract scheduleTemplateShapefileCreation(scenarioId: string): void;

  abstract getTemplateShapefile(
    scenarioId: string,
    stream: stream.Writable,
  ): Promise<typeof FileNotFound | typeof FileNotReady | typeof FilePiped>;
}
