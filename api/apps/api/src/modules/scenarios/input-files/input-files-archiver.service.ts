import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';
import * as archiver from 'archiver';

import { InputFilesService, InputZipFailure } from './input-files.service';
import { PassThrough } from 'stream';

@Injectable()
export class InputFilesArchiverService {
  constructor(private readonly inputFiles: InputFilesService) {}

  async archive(scenarioId: string): Promise<Either<InputZipFailure, Buffer>> {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const settings = await this.inputFiles.getSettings();
    const inputDirectory = settings.INPUTDIR;

    const inputDatContent = this.inputFiles.getInputParameterFile(scenarioId);
    const specDatContent = this.inputFiles.getSpecDatContent(scenarioId);
    const boundDatContent = this.inputFiles.getBoundDatContent(scenarioId);
    const puvsprDatContent = this.inputFiles.getPuvsprDatContent(scenarioId);
    const costSurfaceStreamContent = new PassThrough();

    await this.inputFiles.readCostSurface(scenarioId, costSurfaceStreamContent);

    archive.append(costSurfaceStreamContent, {
      name: `${inputDirectory}/${settings.PUNAME}`,
    });
    archive.append(await inputDatContent, {
      name: `input.dat`,
    });
    archive.append(await specDatContent, {
      name: `${inputDirectory}/${settings.SPECNAME}`,
    });
    archive.append(await boundDatContent, {
      name: `${inputDirectory}/${settings.BOUNDNAME}`,
    });
    archive.append(await puvsprDatContent, {
      name: `${inputDirectory}/${settings.PUVSPRNAME}`,
    });

    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      archive.on('data', (chunk) => {
        buffers.push(chunk);
      });
      archive.on('finish', () => {
        resolve(right(Buffer.concat(buffers)));
      });
      archive.on('error', function (err) {
        reject(err);
      });
      archive.finalize();
    });
  }
}
