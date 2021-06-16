import { Injectable, Scope } from '@nestjs/common';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class MarxanRun extends EventEmitter {
  #processId?: number;
  #stdOut: string[] = [];
  #stdError: string[] = [];

  execute(bin: string, workingDirectory: string): void {
    const sub = spawn(bin, {
      cwd: workingDirectory,
    });

    this.emit(`pid`, sub.pid);

    sub.stderr.on('data', (chunk) => {
      this.#stdError.push(chunk.toString());
    });

    sub.stdout.on('data', (chunk) => {
      // TODO place for "progress update" parsing and emitting to consumer
      this.#stdOut.push(chunk.toString());
    });

    sub.on('exit', (code) => {
      if (code !== 0) {
        this.emit('error', {
          code,
          stdError: this.#stdError,
        });
      }
      this.emit('finished');
    });
  }

  get processId() {
    return this.#processId;
  }

  get stdOut() {
    return this.#stdOut;
  }
}
