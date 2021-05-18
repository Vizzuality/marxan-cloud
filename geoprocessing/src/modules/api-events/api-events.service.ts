import { HttpService, Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from './events.enum';
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

  async create<T>(
    resourceId: string,
    kind: API_EVENT_KINDS,
    data?: T,
  ): Promise<void> {
    // TODO what if it failed? (currently validateStatus "swallows" the error)
    await this.http
      .post(
        this.#apiUrl + `/v1/api-events`,
        {
          kind,
          topic: resourceId,
          data,
        },
        {
          headers: {
            Accept: 'application/json',
          },
          validateStatus: () => true,
        },
      )
      .toPromise();
  }
}
