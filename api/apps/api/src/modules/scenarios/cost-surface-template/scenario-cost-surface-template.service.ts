import * as stream from 'stream';

export const FileNotFound = Symbol('file not found');

export const FileNotReady = Symbol('file not ready');

export const FilePiped = Symbol('file piped');

export abstract class ScenarioCostSurfaceTemplateService {
  abstract scheduleTemplateShapefileCreation(scenarioId: string): void;

  abstract getTemplateShapefile(
    scenarioId: string,
    stream: stream.Writable,
  ): Promise<typeof FileNotFound | typeof FileNotReady | typeof FilePiped>;
}
