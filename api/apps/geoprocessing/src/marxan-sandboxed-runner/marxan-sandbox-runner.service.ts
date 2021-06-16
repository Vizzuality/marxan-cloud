import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

import { InputFiles } from './ports/input-files';
import { SolutionsRepository } from './ports/solutions-repository';
import { Workspace } from './ports/workspace';
import { MarxanRunner } from './ports/marxan-runner';

@Injectable()
export class MarxanSandboxRunnerService {
  constructor(
    private readonly workspaceService: Workspace,
    private readonly inputFilesProvider: InputFiles,
    private readonly marxanRunner: MarxanRunner,
    private readonly solutionsRepository: SolutionsRepository,
  ) {}

  async run(forScenarioId: string): Promise<unknown> {
    const {
      cleanup,
      marxanBinaryPath,
      workingDirectory,
    } = await this.workspaceService.get();

    // TODO remove
    console.log(`doing things in..`, workingDirectory);

    await this.inputFilesProvider.include(forScenarioId, workingDirectory);
    const {
      exitCode: _code,
      stdError: _errors,
      stdOut: _stdout,
    } = await this.marxanRunner.execute(marxanBinaryPath, workingDirectory);
    await this.solutionsRepository.saveFrom(workingDirectory, forScenarioId);

    // TODO: finally
    // await cleanup();

    // TODO wrap in another class
    return new Promise((resolve, reject) => {
      const stdError: string[] = [];
      const stdOut: string[] = [];
      console.log(`marxanBinaryPath`, marxanBinaryPath);
      const sub = spawn(marxanBinaryPath, {
        cwd: workingDirectory,
      });
      sub.stderr.on('data', (chunk) => {
        stdError.push(chunk.toString());
      });
      sub.stdout.on('data', (chunk) => {
        console.log(`::stdout`, chunk.toString());
        stdOut.push(chunk.toString());
      });

      sub.on(`finish`, (f) => {
        console.log(`finished`, f);
      });

      sub.on('exit', (code) => {
        console.log(`exit`, code);
        if (code !== 0) {
          return reject(stdError);
        }
        return resolve(1);
      });
      return;
    });
  }
}
