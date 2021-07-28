import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { assertDefined } from '@marxan/utils';

import { Workspace } from './ports/workspace';
import { Cancellable } from './ports/cancellable';
import { Progress } from './progress';

interface MessageEvents {
  error(error: {
    signal?: NodeJS.Signals | null;
    code?: number | null;
    stdError: string[];
  }): void;

  finished(): void;

  progress(progress: number): void;
}

const MarxanRunEmitter: new () => TypedEmitter<MessageEvents> = EventEmitter;

export class MarxanRun extends MarxanRunEmitter implements Cancellable {
  #process?: ChildProcessWithoutNullStreams;
  #stdOut: string[] = [];
  #stdError: string[] = [];

  async cancel(): Promise<void> {
    this.#process?.kill('SIGTERM');
    return;
  }

  executeIn(
    workspace: Pick<Workspace, 'workingDirectory' | 'marxanBinaryPath'>,
  ): void {
    this.#process = spawn(workspace.marxanBinaryPath, {
      cwd: workspace.workingDirectory,
    });

    assertDefined(this.#process);

    this.#process.stderr.on('data', (chunk) => {
      this.#stdError.push(chunk.toString());
    });

    const progressWatcher = new Progress();
    this.#process.stdout.on('data', (chunk) => {
      const currentProgress = progressWatcher.read(chunk);
      this.emit(`progress`, currentProgress);
      // TODO place for "progress update" parsing and emitting to consumer
      this.#stdOut.push(chunk.toString());
    });

    this.#process.on('exit', (code, signal) => {
      if (signal) {
        this.emit('error', {
          signal,
          stdError: this.#stdError,
        });
        return;
      }
      if (code !== 0) {
        this.emit('error', {
          code,
          stdError: this.#stdError,
        });
        return;
      }
      this.emit('finished');
    });
  }

  get stdOut() {
    return this.#stdOut;
  }
}
