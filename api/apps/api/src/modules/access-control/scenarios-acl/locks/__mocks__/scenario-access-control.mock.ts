import { Permit } from '@marxan-api/modules/access-control/access-control.types';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScenarioAccessControlMock implements ScenarioAccessControl {
  mock: jest.Mock<boolean> = jest.fn(() => true);

  async canCreateScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canEditScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canViewScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canDeleteScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canCloneScenario(userId: string, scenarioId: string): Promise<Permit> {
    return this.mock(userId, scenarioId);
  }
  async canReleaseLock(userId: string, scenarioId: string): Promise<Permit> {
    return this.mock(userId, scenarioId);
  }
}
