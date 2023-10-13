import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

import { AppConfig } from '../utils/config.utils';

@Injectable()
export class XApiGuard implements CanActivate {
  readonly #secret: string;

  constructor() {
    // throws if not provided

    this.#secret = AppConfig.get<string>('auth.xApiKey.secret')!;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // real requests seems to lowercase all headers names
    const value =
      request.headers?.['x-api-key'] ?? request.headers?.['X-Api-Key'];

    return value === this.#secret;
  }
}
