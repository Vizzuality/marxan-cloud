import * as stream from 'stream';
import {
  ScenarioCostSurfaceTemplateService,
  FileNotFound,
  FileNotReady,
  FilePiped,
} from '../scenario-cost-surface-template.service';

export class FakeCostTemplateService extends ScenarioCostSurfaceTemplateService {
  scheduledTemplateCreation: string[] = [];
  templatesInProgress: string[] = [];
  availableTemplatesForScenarios: Record<string, string> = {};

  scheduleTemplateShapefileCreation(scenarioId: string) {
    this.scheduledTemplateCreation.push(scenarioId);
  }

  async getTemplateShapefile(
    scenarioId: string,
    writableStream: stream.Writable,
  ) {
    if (
      this.scheduledTemplateCreation.includes(scenarioId) ||
      this.templatesInProgress.includes(scenarioId)
    ) {
      return FileNotReady;
    }

    if (!this.availableTemplatesForScenarios[scenarioId]) {
      return FileNotFound;
    }

    const readableStream = new stream.Readable();
    readableStream.pipe(writableStream);
    readableStream.push(this.availableTemplatesForScenarios[scenarioId]);
    readableStream.push(null);
    return FilePiped;
  }
}
