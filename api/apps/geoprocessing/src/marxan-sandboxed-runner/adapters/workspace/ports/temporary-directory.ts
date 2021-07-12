import { WorkingDirectory } from '../../../ports/working-directory';

/**
 * Marxan's sandbox for running
 */
export abstract class TemporaryDirectory {
  abstract get(): Promise<WorkingDirectory>;

  abstract cleanup(directory: string): Promise<void>;
}
