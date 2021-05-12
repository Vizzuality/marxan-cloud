/// <reference types="jest" />
import { ArePuidsAllowedPort } from '../are-puids-allowed.port';
export declare class ArePuidsAllowedMock implements ArePuidsAllowedPort {
    mock: jest.Mock<Promise<{
        errors: string[];
    }>, [
        string,
        string[]
    ]>;
    validate(scenarioId: string, puIds: string[]): Promise<{
        errors: unknown[];
    }>;
}
