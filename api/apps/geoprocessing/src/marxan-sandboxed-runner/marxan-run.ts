import { Injectable, Scope } from '@nestjs/common';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';

interface MessageEvents {
  pid(pid: number): void;
  error(error: {
    signal?: 'SIGSEGV';
    code?: number | null | NodeJS.Signals;
    stdError: string[];
  }): void;
  finished(): void;
}

const MarxanRunEmitter: new () => TypedEmitter<MessageEvents> = EventEmitter;

@Injectable({
  scope: Scope.TRANSIENT,
})
export class MarxanRun extends MarxanRunEmitter {
  #processId?: number;
  #stdOut: string[] = [];
  #stdError: string[] = [];

  execute(bin: string, workingDirectory: string): void {
    const sub = spawn(bin, {
      cwd: workingDirectory,
    });

    this.emit(`pid`, sub.pid);

    sub.stderr.on('data', (chunk) => {
      console.log(chunk.toString());
      this.#stdError.push(chunk.toString());
    });

    sub.stdout.on('data', (chunk) => {
      // TODO place for "progress update" parsing and emitting to consumer
      this.#stdOut.push(chunk.toString());
      console.log(chunk.toString());
    });

    sub.on('exit', (code, signal) => {
      if (signal === 'SIGSEGV') {
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

  get processId() {
    return this.#processId;
  }

  get stdOut() {
    return this.#stdOut;
  }
}
