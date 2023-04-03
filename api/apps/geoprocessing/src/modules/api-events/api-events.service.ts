import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfig } from '../../utils/config.utils';

@Injectable()
export class ApiEventsService {
  readonly #secret: string;
  readonly #apiUrl: string;

  constructor(private readonly http: HttpService) {
    // TODO debt: config shall be injected (nestjs/config); it isn't really unit-testable
    // will throw if not provided
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#secret = AppConfig.get<string>('auth.xApiKey.secret')!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#apiUrl = AppConfig.get<string>('api.url')!;
  }

  async create<T extends Record<string, unknown>>(
    resourceId: string,
    kind: API_EVENT_KINDS,
    data?: T,
  ): Promise<void> {
    await this.http
      .post(
        this.#apiUrl + `/api/v1/api-events`,
        {
          kind,
          topic: resourceId,
          data: JSON.stringify(data),
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': this.#secret,
          },
          validateStatus: () => true,
        },
      )
      .toPromise();
  }
}
