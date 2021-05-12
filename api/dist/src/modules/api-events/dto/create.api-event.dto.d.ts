import { API_EVENT_KINDS } from '../api-event.api.entity';
import * as ApiEventsUserData from 'modules/api-events/dto/apiEvents.user.data.dto';
export declare class CreateApiEventDTO {
    kind: API_EVENT_KINDS;
    topic: string;
    data?: Record<string, unknown> | ApiEventsUserData.ActivationTokenGeneratedV1Alpha1;
}
