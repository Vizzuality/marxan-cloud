import { Injectable } from '@nestjs/common';
import { MarxanRunner } from '../ports/marxan-runner';

@Injectable()
export class MarxanSubprocess implements MarxanRunner {
  async execute(
    _bin: string,
    _workingDirectory: string,
  ): Promise<{ stdOut: string[]; stdError: string[]; exitCode: number }> {
    return Promise.resolve({ exitCode: 0, stdError: [], stdOut: [] });
  }
}
