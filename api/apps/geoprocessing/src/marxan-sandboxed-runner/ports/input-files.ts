/**
 * Take some arbitrary input and create relevant files structure for Marxan
 */
export abstract class InputFiles {
  abstract include(values: unknown, directory: string): Promise<void>;
}
