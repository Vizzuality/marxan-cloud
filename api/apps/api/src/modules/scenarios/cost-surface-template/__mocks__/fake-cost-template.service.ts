import * as stream from 'stream';
import {
  ScenarioCostSurfaceTemplateService,
  FileNotReady,
  FilePiped,
} from '../scenario-cost-surface-template.service';

export class FakeCostTemplateService extends ScenarioCostSurfaceTemplateService {
  scheduledTemplateCreation: string[] = [];
  templatesInProgress: string[] = [];
  availableTemplatesForScenarios: Record<string, string> = {};

  async getTemplateShapefile(
    scenarioId: string,
    writableStream: stream.Writable,
  ) {
    if (this.templatesInProgress.includes(scenarioId)) {
      return FileNotReady;
    }

    const readableStream = new stream.Readable();
    readableStream.pipe(writableStream);
    readableStream.push(this.availableTemplatesForScenarios[scenarioId]);
    readableStream.push(null);
    return FilePiped;
  }
}
