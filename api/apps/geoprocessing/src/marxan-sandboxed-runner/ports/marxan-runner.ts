export abstract class MarxanRunner {
  abstract execute(
    bin: string,
    workingDirectory: string,
  ): Promise<{
    stdOut: string[];
    stdError: string[];
    exitCode: number;
  }>;
}
