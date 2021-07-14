import { Injectable } from '@nestjs/common';
import { SpecDatService } from './spec.dat.service';
import { PuvsprDatService } from './puvspr.dat.service';
import { BoundDatService } from './bound.dat.service';

@Injectable()
export class InputFilesService {
  constructor(
    // private readonly inputParameterFileProvider: InputParameterFileProvider,
    private readonly specDatService: SpecDatService,
    private readonly puvsprDatService: PuvsprDatService,
    private readonly boundDatService: BoundDatService,
  ) {}

  async getInputArchive(_scenarioId: string): Promise<Buffer> {
    return Buffer.from([]);
  }

  // input dat
  // getInputParameterFile(scenarioId: string) {
  //   return this.inputParameterFileProvider.getInputParameterFile(scenarioId);
  // }

  getSpecDatContent(scenarioId: string) {
    return this.specDatService.getSpecDatContent(scenarioId);
  }

  getBoundDatContent(scenarioId: string) {
    return this.boundDatService.getContent(scenarioId);
  }

  getPuvsprDatContent(scenarioId: string) {
    return this.puvsprDatService.getPuvsprDatContent(scenarioId);
  }
}
