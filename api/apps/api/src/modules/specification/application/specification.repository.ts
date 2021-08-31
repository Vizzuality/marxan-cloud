import { Specification } from '../domain';

export abstract class SpecificationRepository {
  abstract save(specification: Specification): Promise<void>;

  abstract getById(id: string): Promise<Specification | undefined>;

  abstract transaction<T>(
    code: (repo: SpecificationRepository) => Promise<T>,
  ): Promise<T>;

  abstract getLastUpdated(ids: string[]): Promise<Specification | undefined>;
}
