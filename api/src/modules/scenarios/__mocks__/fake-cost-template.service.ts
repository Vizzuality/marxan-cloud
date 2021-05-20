import * as stream from 'stream';
import {
  CostTemplateService,
  FileNotFound,
  FileNotReady,
  FilePiped,
} from '../cost-template.service';

export class FakeCostTemplateService extends CostTemplateService {
  scheduledTemplateCreation: string[] = [];
  templatesInProgress: string[] = [];
  availableTemplatesForScenarios: Record<string, string> = {};

  scheduleShapefileCostTemplateCreation(scenarioId: string) {
    this.scheduledTemplateCreation.push(scenarioId);
  }

  async getShapefileCostTemplate(
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
