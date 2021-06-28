/**
 * Marxan's sandbox for running
 */
export abstract class TemporaryDirectory {
  abstract get(): Promise<string>;

  abstract cleanup(directory: string): Promise<void>;
}
