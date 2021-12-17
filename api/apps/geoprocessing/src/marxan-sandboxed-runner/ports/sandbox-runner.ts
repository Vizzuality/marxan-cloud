export abstract class SandboxRunner<Input, Result> {
  abstract kill(ofScenarioId: string): void;

  abstract run(
    input: Input,
    progressCallback: (progress: number) => void,
  ): Promise<Result>;
}
