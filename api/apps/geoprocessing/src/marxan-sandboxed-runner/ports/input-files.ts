/**
 * Take some arbitrary input and create relevant files structure for Marxan
 */
export abstract class InputFiles {
  abstract include(scenarioId: string, directory: string): Promise<void>;
}
