import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { copySync } from 'fs-extra';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import { AppModule } from '@marxan-geoprocessing/app.module';
import { InputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/input-files';

let app: INestApplication;
let sut: MarxanSandboxRunnerService;
beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(InputFiles)
    .useClass(SampleMarxanInputFilesCreator)
    .compile();
  app = await moduleFixture.createNestApplication().init();
  sut = app.get(MarxanSandboxRunnerService);
});

describe(`when...`, () => {
  it(`then werks!`, async () => {
    await sut.run('asdf');

    // TODO ugh, verify some outputs?
  }, 20000);
});

/**
 * for the output files we will want to first run a small script in python that will do some calcs we need to do for the 5 most different solutions; and later we will need to save in the db prior a transformation the next files: output_sum.csv, outputmv_xxxx.csv and outputr_xxxx.csv
 * the other files are derived from this 3 plus the output_log and some summary of the input in the output_sen
 *
 */

// TODO: later it may be disposed and use "real" implementation
// for now, as we don't know yet the values/inputs, we simply
// copy sample input provided by Marxan
@Injectable()
class SampleMarxanInputFilesCreator implements InputFiles {
  include(values: unknown, directory: string): Promise<void> {
    copySync(
      process.cwd() +
        `/apps/geoprocessing/src/marxan-sandboxed-runner/__mocks__/sample-input`,
      directory,
    );
    return Promise.resolve(undefined);
  }
}
