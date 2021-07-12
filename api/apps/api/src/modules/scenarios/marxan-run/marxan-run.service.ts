import { Injectable } from '@nestjs/common';
import * as stream from 'stream';

import { CostSurfaceViewService } from '../cost-surface-readmodel/cost-surface-view.service';
import { InputParameterFileProvider } from '../input-parameter-file.provider';

@Injectable()
export class MarxanRunService {
  constructor(
    private readonly costSurfaceService: CostSurfaceViewService,
    private readonly inputParameterFileProvider: InputParameterFileProvider,
  ) {}

  async getInputParameterFile(scenarioId: string) {
    return this.inputParameterFileProvider.getInputParameterFile(scenarioId);
  }

  async getCostSurfaceCsv(scenarioId: string, res: stream.Writable) {
    await this.costSurfaceService.read(scenarioId, res);
  }
}
