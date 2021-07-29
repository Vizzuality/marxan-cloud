import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { Either, isLeft } from 'fp-ts/Either';
import * as unzipper from 'unzipper';

import { InputFilesArchiverService } from './input-files-archiver.service';
import { IoSettings } from './input-params/io-settings';
import { InputFilesService } from './input-files.service';
import { Writable } from 'stream';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`when all input files are available`, () => {
  beforeEach(() => {
    fixtures.GivenInputDirectoryIsDefined();
    fixtures.GivenFilesContentIsAvailable();
  });

  it(`should include them in archive`, async () => {
    const archive = await fixtures.sut.archive(fixtures.scenarioId);
    await fixtures.ThenArchiveContainsInputFiles(archive);
  });
});

const getFixtures = async () => {
  const app = await Test.createTestingModule({
    providers: [
      InputFilesArchiverService,
      {
        provide: InputFilesService,
        useClass: FakeInputFiles,
      },
    ],
  }).compile();
  const inputFileService: FakeInputFiles = app.get(InputFilesService);
  const scenarioId = `scenario-id`;
  const inputDirectoryName = 'input-directory';
  const specFileName = `spec-dat-file`;
  const boundFileName = `bound-dat-file`;
  const puvsprFileName = `puvspr-dat-file`;
  const puFileName = `pu-dat-file`;

  return {
    sut: app.get(InputFilesArchiverService),
    scenarioId,
    GivenInputDirectoryIsDefined: () => {
      inputFileService.settingsMock.mockImplementationOnce(() => ({
        INPUTDIR: inputDirectoryName,
        SPECNAME: specFileName,
        BOUNDNAME: boundFileName,
        PUVSPRNAME: puvsprFileName,
        PUNAME: puFileName,
      }));
    },
    GivenFilesContentIsAvailable: () => {
      inputFileService.inputParamsMock.mockImplementationOnce(
        async () => `input.dat content`,
      );
      inputFileService.specMock.mockImplementationOnce(
        async () => `spec.dat content`,
      );
      inputFileService.boundMock.mockImplementationOnce(
        async () => `bound.dat content`,
      );
      inputFileService.puvsprMock.mockImplementationOnce(
        async () => `puvspr.dat content`,
      );
      inputFileService.puMock.mockImplementationOnce(
        (_: string, writable: Writable) => {
          'costsurface'.split('').forEach((chunk) => {
            setTimeout(() => {
              writable.write(chunk);
              if (chunk === 'e') {
                writable.end();
              }
            }, 10);
          });
        },
      );
    },
    ThenArchiveContainsInputFiles: async (archive: Either<any, Buffer>) => {
      if (isLeft(archive)) {
        expect(archive.left).toBeUndefined();
        return;
      }
      const directory = await unzipper.Open.buffer(archive.right);

      const inputDat = directory.files.find((e) => e.path === `input.dat`);
      expect(inputDat).toBeDefined();
      expect((await inputDat!.buffer?.()).toString()).toEqual(
        `input.dat content`,
      );
      expect(inputFileService.inputParamsMock).toHaveBeenCalledWith(scenarioId);

      const specDat = directory.files.find(
        (e) => e.path === `${inputDirectoryName}/${specFileName}`,
      );
      expect(specDat).toBeDefined();
      expect((await specDat!.buffer?.()).toString()).toEqual(
        `spec.dat content`,
      );
      expect(inputFileService.specMock).toHaveBeenCalledWith(scenarioId);

      const boundDat = directory.files.find(
        (e) => e.path === `${inputDirectoryName}/${boundFileName}`,
      );
      expect(boundDat).toBeDefined();
      expect((await boundDat!.buffer?.()).toString()).toEqual(
        `bound.dat content`,
      );
      expect(inputFileService.boundMock).toHaveBeenCalledWith(scenarioId);

      const puvSprDat = directory.files.find(
        (e) => e.path === `${inputDirectoryName}/${puvsprFileName}`,
      );
      expect(puvSprDat).toBeDefined();
      expect((await puvSprDat!.buffer?.()).toString()).toEqual(
        `puvspr.dat content`,
      );
      expect(inputFileService.puvsprMock).toHaveBeenCalledWith(scenarioId);

      const puDat = directory.files.find(
        (e) => e.path === `${inputDirectoryName}/${puFileName}`,
      );
      expect(puDat).toBeDefined();
      expect((await puDat!.buffer?.()).toString()).toEqual(`costsurface`);
      expect(inputFileService.puMock).toHaveBeenCalledWith(
        scenarioId,
        expect.anything(),
      );
    },
  };
};

@Injectable()
class FakeInputFiles {
  settingsMock = jest.fn<Partial<IoSettings>, []>();
  inputParamsMock = jest.fn();
  specMock = jest.fn();
  boundMock = jest.fn();
  puvsprMock = jest.fn();
  puMock = jest.fn();

  getSettings() {
    return this.settingsMock();
  }

  getInputParameterFile(scenarioId: string) {
    return this.inputParamsMock(scenarioId);
  }

  getSpecDatContent(scenarioId: string) {
    return this.specMock(scenarioId);
  }

  getBoundDatContent(scenarioId: string) {
    return this.boundMock(scenarioId);
  }

  getPuvsprDatContent(scenarioId: string) {
    return this.puvsprMock(scenarioId);
  }

  readCostSurface(scenarioId: string, writeStream: Writable) {
    return this.puMock(scenarioId, writeStream);
  }
}
