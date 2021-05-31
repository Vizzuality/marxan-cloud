import { CreateApiEventDTO } from '../../../api-events/dto/create.api-event.dto';
import { AppInfoDTO } from '../../../../dto/info.dto';
import { ApiEvent } from '../../../api-events/api-event.api.entity';

export class ApiServiceFake {
  mock = jest.fn();

  create(createModel: CreateApiEventDTO, info?: AppInfoDTO): Promise<ApiEvent> {
    return this.mock(createModel, info);
  }
}
