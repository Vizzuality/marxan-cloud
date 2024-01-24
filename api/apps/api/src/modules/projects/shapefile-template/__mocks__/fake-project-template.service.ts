import * as stream from 'stream';
import {
  ProjectTemplateService,
  FileNotReady,
  FilePiped,
} from '../project-template.service';

export class FakeProjectTemplateService extends ProjectTemplateService {
  scheduledTemplateCreation: string[] = [];
  templatesInProgress: string[] = [];
  availableTemplatesForProject: Record<string, string> = {};

  async getTemplateShapefile(
    projectId: string,
    writableStream: stream.Writable,
  ) {
    if (this.templatesInProgress.includes(projectId)) {
      return FileNotReady;
    }

    const readableStream = new stream.Readable();
    readableStream.pipe(writableStream);
    readableStream.push(this.availableTemplatesForProject[projectId]);
    readableStream.push(null);
    return FilePiped;
  }
}
