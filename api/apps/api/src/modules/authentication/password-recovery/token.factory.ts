import * as crypto from 'crypto';
import { FactoryProvider, Inject, Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { Token } from './token';

export abstract class TokenFactory {
  abstract create(userId: string): Promise<Token>;
}

export const expirationOffsetToken = Symbol('expiration offset token');
export const expirationOffsetProvider: FactoryProvider<number> = {
  provide: expirationOffsetToken,
  useFactory: () => {
    return Number(AppConfig.get<number | string>('passwordReset.expiration'));
  },
};

@Injectable()
export class CryptoTokenFactory implements TokenFactory {
  constructor(
    @Inject(expirationOffsetToken)
    private readonly expirationOffset: number,
  ) {}
  async create(userId: string, now = Date.now()): Promise<Token> {
    const value = crypto.randomBytes(32).toString('hex');
    const expirationDate = new Date(now + this.expirationOffset);
    return {
      userId,
      value,
      createdAt: new Date(now),
      expiredAt: expirationDate,
    };
  }
}
