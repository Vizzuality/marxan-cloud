import { Server } from 'http';
import { E2E_CONFIG } from '../e2e.config';
import * as request from 'supertest';

export class ProjectRequests {
  constructor(private readonly app: Server) {}

  public createProject(
    jwt: string,
    data = E2E_CONFIG.projects.valid.minimal(),
  ) {
    return request(this.app)
      .post('/api/v1/projects')
      .auth(jwt, { type: 'bearer' })
      .send(data);
  }
  public listProjects(
    jwt: string,
    query: { include: Array<'users' | 'scenarios'> } = { include: [] },
  ) {
    return request(this.app)
      .get('/api/v1/projects')
      .query(query)
      .auth(jwt, { type: 'bearer' });
  }
  public deleteProject(jwt: string, projectId: string) {
    return request(this.app)
      .delete(`/api/v1/projects/${projectId}`)
      .auth(jwt, { type: 'bearer' });
  }
}
