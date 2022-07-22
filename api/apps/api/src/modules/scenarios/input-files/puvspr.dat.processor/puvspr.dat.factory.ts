import { Injectable } from '@nestjs/common';
import { PuvsprDatLegacyProject } from './puvspr.dat.legacy-project';
import { PuvsprDatMarxanProject } from './puvspr.dat.marxan-project';

@Injectable()
export class PuvrsprDatFactory {
  constructor(
    private readonly puvsprDatLegacyProject: PuvsprDatLegacyProject,
    private readonly puvsprDatMarxanProject: PuvsprDatMarxanProject,
  ) {}
  public getPuvsrDat(legacy: boolean) {
    return legacy ? this.puvsprDatLegacyProject : this.puvsprDatMarxanProject;
  }
}
