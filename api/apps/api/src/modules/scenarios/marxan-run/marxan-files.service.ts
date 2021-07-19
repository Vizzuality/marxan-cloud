import { Injectable } from '@nestjs/common';
import * as stream from 'stream';

import { CostSurfaceViewService } from '../cost-surface-readmodel/cost-surface-view.service';
import { PuvsprDatService } from '../input-files/puvspr.dat.service';
import { BoundDatService } from '../input-files/bound.dat.service';
import { InputParameterFileProvider } from './input-parameter-file.provider';

@Injectable()
export class MarxanFilesService {
  constructor(
    private readonly costSurfaceService: CostSurfaceViewService,
    private readonly inputParameterFileProvider: InputParameterFileProvider,
    private readonly puvsprDatService: PuvsprDatService,
    private readonly boundDatService: BoundDatService,
  ) {}

  async getInputParameterFile(scenarioId: string) {
    return this.inputParameterFileProvider.getInputParameterFile(scenarioId);
  }

  async getCostSurfaceCsv(scenarioId: string, res: stream.Writable) {
    await this.costSurfaceService.read(scenarioId, res);
  }

  async getPuvsprDat(scenarioId: string) {
    return this.puvsprDatService.getPuvsprDatContent(scenarioId);
  }

  async getBoundDat(scenarioId: string) {
    return this.boundDatService.getContent(scenarioId);
  }
}
