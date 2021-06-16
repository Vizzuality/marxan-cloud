import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { MarxanConfig } from './marxan-config';

import { TemporaryDirectory } from './ports/temporary-directory';
import { LinkMarxan } from './ports/link-marxan';
import { InputFiles } from './ports/input-files';

@Injectable()
export class MarxanSandboxRunnerService {
  constructor(
    private readonly marxanConfig: MarxanConfig,
    private readonly cwdService: TemporaryDirectory,
    private readonly binaryLinker: LinkMarxan,
    private readonly inputFilesProvider: InputFiles,
  ) {}

  /**
   * to be defined...
   * @param values
   */
  async run(values: unknown): Promise<unknown> {
    const workDirectory = await this.cwdService.get();
    const sandboxedBinary = workDirectory + `/marxan`;
    console.log(`doing things in..`, workDirectory);

    await this.binaryLinker.link(this.marxanConfig.binPath, sandboxedBinary);
    await this.inputFilesProvider.include(values, workDirectory);

    // TODO: finally
    // this.cwdService.cleanup(workDirectory)

    // TODO wrap in another class
    return new Promise((resolve, reject) => {
      const stdError: string[] = [];
      const stdOut: string[] = [];
      const sub = spawn(sandboxedBinary, {
        cwd: workDirectory,
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
