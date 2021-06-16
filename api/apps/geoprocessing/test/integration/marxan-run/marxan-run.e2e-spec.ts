import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { copySync } from 'fs-extra';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import { AppModule } from '@marxan-geoprocessing/app.module';
import { InputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/input-files';

import { delay } from '../../utils';

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
    await sut.run(1);
  }, 20000);
});

// TODO: later it may be disposed and use "real" implementation
// for now, as we don't know yet the values/inputs, we simply
// copy sample input provided by Marxan
@Injectable()
class SampleMarxanInputFilesCreator implements InputFiles {
  include(values: unknown, directory: string): Promise<void> {
    console.log(
      `...copy...`,
      process.cwd() +
        `/apps/geoprocessing/src/marxan-sandboxed-runner/__mocks__/sample-input`,
    );
    copySync(
      process.cwd() +
        `/apps/geoprocessing/src/marxan-sandboxed-runner/__mocks__/sample-input`,
      directory,
    );
    return Promise.resolve(undefined);
  }
}
