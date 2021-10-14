import { Token } from './token';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as crypto from 'crypto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PasswordRecoveryToken } from './password-recovery-token.api.entity';

export abstract class RecoveryTokenRepository {
  abstract save(param: Token): Promise<void>;

  abstract findAndDeleteToken(token: string): Promise<Token | undefined>;
}

@Injectable()
export class TypeORMRecoveryTokenRepository implements RecoveryTokenRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async save(token: Token): Promise<void> {
    await this.entityManager.getRepository(PasswordRecoveryToken).save({
      ...token,
      value: this.hash(token.value),
    });
  }

  async findAndDeleteToken(token: string): Promise<Token | undefined> {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const tokens = transactionalEntityManager.getRepository(
          PasswordRecoveryToken,
        );
        const tokenEntity = await tokens.findOne({
          where: {
            value: this.hash(token),
          },
          lock: {
            mode: 'pessimistic_write_or_fail',
          },
        });
        if (tokenEntity) {
          await tokens.delete({
            userId: tokenEntity.userId,
          });
          return {
            ...tokenEntity,
            value: token,
          };
        }
      },
    );
  }

  private hash(tokenValue: string) {
    return crypto.createHash('sha512').update(tokenValue, `utf8`).digest('hex');
  }
}
