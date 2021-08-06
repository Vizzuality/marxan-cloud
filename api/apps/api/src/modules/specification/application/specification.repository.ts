import { Specification } from '../domain';

export abstract class SpecificationRepository {
  abstract save(specification: Specification): Promise<void>;

  abstract getById(id: string): Promise<Specification | undefined>;
}
