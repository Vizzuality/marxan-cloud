import { InfoDTO } from 'nestjs-base-service';
import { User } from '../users/user.api.entity';

export interface SearchCriteria<T> extends InfoDTO<T> {
  params?: {
    scenarioId?: string;
  };
}

export type UserSearchCriteria = SearchCriteria<User>;
