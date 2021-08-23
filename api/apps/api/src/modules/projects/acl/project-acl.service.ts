import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';

export const alreadyOwned = Symbol(`already-owned`);
export const notAnOwner = Symbol(`not-an-owner`);

export type CanReadError = typeof notAnOwner;
export type AssignOwnerError = typeof alreadyOwned;

@Injectable()
export class ProjectAclService {
  async canRead(
    projectId: string,
    userId: string,
  ): Promise<Either<CanReadError, boolean>> {
    return right(false);
  }

  async assignOwner(
    projectId: string,
    userId: string,
  ): Promise<Either<AssignOwnerError, true>> {
    return right(true);
  }

  async getOwn(userId: string): Promise<string[]> {
    return [];
  }
}
