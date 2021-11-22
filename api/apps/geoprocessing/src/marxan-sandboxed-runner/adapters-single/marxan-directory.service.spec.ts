import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { MarxanDirectory } from './marxan-directory.service';
import { Workspace } from '../ports/workspace';
import { FileReader } from './file-reader';
import { WorkingDirectory } from '../ports/working-directory';

let sut: MarxanDirectory;
let workspace: Workspace;
let fileReader: FakeFileReader;

const cwd = '/tmp/test-work-dir';
const bin = `${cwd}/app`;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      MarxanDirectory,
      {
        provide: FileReader,
        useClass: FakeFileReader,
      },
    ],
  }).compile();
  fileReader = sandbox.get(FileReader);
  sut = sandbox.get(MarxanDirectory);
  workspace = new Workspace(
    cwd as WorkingDirectory,
    bin,
    () => Promise.resolve(),
    () => Promise.resolve(),
  );
});

describe(`when input.dat is missing`, () => {
  beforeEach(() => {
    fileReader.mock.mockImplementation(() => {
      throw new Error('No such file or directory!');
    });
  });

  it(`should throw`, () => {
    expect(() => sut.get('INPUTDIR', workspace.workingDirectory)).toThrow(
      /No such file/,
    );
  });
});

describe(`when input.dat does not contain requested type`, () => {
  beforeEach(() => {
    fileReader.mock.mockImplementation(
      () => `
OUTPUTDIR output
prefix as a comment should be ignored INPUTDIR somedirectory
BLM 1
    `,
    );
  });

  it(`should throw`, () => {
    expect(() => sut.get('INPUTDIR', workspace.workingDirectory)).toThrow(
      /Cannot find INPUTDIR directory/,
    );
  });
});

describe(`when input.dat does contain requested type`, () => {
  beforeEach(() => {
    fileReader.mock.mockImplementation(
      () => `
INPUTDIR somedirectory
BLM 1
    `,
    );
  });

  it(`should return full path to given type`, () => {
    expect(sut.get('INPUTDIR', workspace.workingDirectory)).toEqual({
      name: `somedirectory`,
      fullPath: cwd + '/somedirectory',
    });
    expect(fileReader.mock).toHaveBeenCalledWith(
      workspace.workingDirectory + '/input.dat',
    );
  });
});

@Injectable()
class FakeFileReader implements FileReader {
  mock = jest.fn();

  read(path: string): string {
    return this.mock(path);
  }
}
