/// <reference types="jest" />
import { RequestJobInput, RequestJobPort } from '../request-job.port';
import { AsyncJob } from '../../../async-job';
export declare class RequestJobPortMock implements RequestJobPort {
    mock: jest.Mock<Promise<AsyncJob>, [RequestJobInput]>;
    queue(input: RequestJobInput): Promise<AsyncJob>;
}
