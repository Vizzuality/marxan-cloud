import { SpecificationRepository } from '../specification.repository';
import { Specification } from '../../domain';
import { v4 } from 'uuid';

export class InMemorySpecificationRepo implements SpecificationRepository {
  #memory: Record<
    string,
    { specification: Specification; lastModifiedAt: Date }
  > = {};

  public readonly scenarioIdToCrashOnSave = v4();

  async getById(id: string): Promise<Specification | undefined> {
    return this.#memory[id]?.specification;
  }

  async save(specification: Specification): Promise<void> {
    if (specification.scenarioId === this.scenarioIdToCrashOnSave) {
      throw new Error(`Database error`);
    }
    this.#memory[specification.id] = {
      specification,
      lastModifiedAt: new Date(),
    };
  }

  count(): number {
    return Object.keys(this.#memory).length;
  }

  async transaction<T>(
    execute: (repo: InMemorySpecificationRepo) => Promise<T>,
  ): Promise<T> {
    return execute(this);
  }

  async getLastUpdated(ids: string[]): Promise<Specification | undefined> {
    const specs = ids
      .map((id) => this.#memory[id])
      .sort(({ lastModifiedAt: a }, { lastModifiedAt: b }) =>
        a < b ? -1 : a > b ? 1 : 0,
      );
    return specs[0]?.specification;
  }
}
