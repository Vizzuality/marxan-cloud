export abstract class SolutionsRepository {
  abstract saveFrom(rootDirectory: string, scenarioId: string): Promise<void>;
}
