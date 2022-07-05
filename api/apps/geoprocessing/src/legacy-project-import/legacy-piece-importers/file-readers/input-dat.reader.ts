import { MarxanInput, MarxanParameters } from '@marxan/marxan-input';
import { readableToBuffer } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';

type TransformVariableFn = (fileValue: string) => number;

export const readInputDatFileFails = Symbol('read Input.dat file fails');
export const invalidInputDatFileVariables = Symbol(
  'invalid Input.dat file variables',
);

export type ReadFileResult = Either<
  typeof readInputDatFileFails | typeof invalidInputDatFileVariables,
  MarxanParameters
>;

@Injectable()
export class InputDatReader {
  private variablesTransfromer: Record<
    keyof MarxanParameters,
    TransformVariableFn
  > = {
    BLM: (fileValue) => parseFloat(fileValue),
    PROP: (fileValue) => parseFloat(fileValue),
    RANDSEED: (fileValue) => parseInt(fileValue),
    BESTSCORE: (fileValue) => parseInt(fileValue),
    NUMREPS: (fileValue) => parseInt(fileValue),
    NUMITNS: (fileValue) => parseInt(fileValue),
    STARTTEMP: (fileValue) => parseInt(fileValue),
    COOLFAC: (fileValue) => parseInt(fileValue),
    NUMTEMP: (fileValue) => parseInt(fileValue),
    COSTTHRESH: (fileValue) => parseFloat(fileValue),
    THRESHPEN1: (fileValue) => parseFloat(fileValue),
    THRESHPEN2: (fileValue) => parseFloat(fileValue),
    RUNMODE: (fileValue) => parseInt(fileValue),
    MISSLEVEL: (fileValue) => parseFloat(fileValue),
    ITIMPTYPE: (fileValue) => parseInt(fileValue),
    HEURTYPE: (fileValue) => parseInt(fileValue),
    CLUMPTYPE: (fileValue) => parseInt(fileValue),
  };

  constructor(private readonly marxanInputValidator: MarxanInput) {}

  private filterCommentsInInputFile(words: string[]) {
    //valid line must only have 2 words separated by one space and
    //variable name must be in capital letters
    return words.length === 2 && /^[A-Z0-9]*$/.test(words[0]);
  }

  private isKeyInInputDatFile(
    variableName: string,
  ): variableName is keyof MarxanParameters {
    return Object.keys(this.variablesTransfromer).includes(variableName);
  }

  private getMarxanParameters(inputDat: string[][]) {
    const marxanParameters: Record<string, number> = {};
    inputDat.forEach(([variableName, stringValue]) => {
      const isKey = this.isKeyInInputDatFile(variableName);
      if (!isKey) return;
      const value = this.variablesTransfromer[
        variableName as keyof MarxanParameters
      ](stringValue);
      marxanParameters[variableName] = value;
    });
    return marxanParameters;
  }

  async readFile(file: Readable): Promise<ReadFileResult> {
    let buffer: Buffer;

    try {
      buffer = await readableToBuffer(file);
    } catch {
      return left(readInputDatFileFails);
    }

    const stringInputDatFile = buffer.toString();

    const inputLines = stringInputDatFile
      .split('\n')
      .filter((line) => line !== '')
      .map((inputLine) => inputLine.split(' '));

    const possibleInputLineVariables = inputLines.filter((wordsInLine) =>
      this.filterCommentsInInputFile(wordsInLine),
    );

    const marxanParameters = this.getMarxanParameters(
      possibleInputLineVariables,
    );

    try {
      const res = this.marxanInputValidator.from(marxanParameters);

      return right(res);
    } catch (error) {
      return left(invalidInputDatFileVariables);
    }
  }
}
