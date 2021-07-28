import { Injectable } from '@nestjs/common';
import { Writable } from 'stream';

import { BoundDatService } from './bound.dat.service';
import { PuvsprDatService } from './puvspr.dat.service';
import { SpecDatService } from './spec.dat.service';
import { CostSurfaceViewService } from './cost-surface-view.service';
import { InputParameterFileProvider } from './input-params/input-parameter-file.provider';

export const metadataNotFound = Symbol(
  `marxan input file - metadata not found`,
);
export const inputZipNotYetAvailable = Symbol(
  `marxan input file - output file not available, possibly error`,
);

export type InputZipFailure =
  | typeof metadataNotFound
  | typeof inputZipNotYetAvailable;

@Injectable()
export class InputFilesService {
  constructor(
    private readonly boundDatService: BoundDatService,
    private readonly puvsprDatService: PuvsprDatService,
    private readonly specDatService: SpecDatService,
    private readonly costSurfaceService: CostSurfaceViewService,
    private readonly inputParameterFileProvider: InputParameterFileProvider,
  ) {}

  getSpecDatContent(scenarioId: string) {
    return this.specDatService.getSpecDatContent(scenarioId);
  }

  getBoundDatContent(scenarioId: string) {
    return this.boundDatService.getContent(scenarioId);
  }

  getPuvsprDatContent(scenarioId: string) {
    return this.puvsprDatService.getPuvsprDatContent(scenarioId);
  }

  async readCostSurface(scenarioId: string, stream: Writable) {
    return this.costSurfaceService.read(scenarioId, stream);
  }

  async getInputParameterFile(scenarioId: string) {
    return this.inputParameterFileProvider.getInputParameterFile(scenarioId);
  }

  async getSettings() {
    return this.inputParameterFileProvider.settings();
  }
}
