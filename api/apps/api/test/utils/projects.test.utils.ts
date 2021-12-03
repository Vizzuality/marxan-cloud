import * as request from 'supertest';
import { INestApplication, Logger } from '@nestjs/common';
import { CreateProjectDTO } from '@marxan-api/modules/projects/dto/create.project.dto';
import { ProjectResultSingular } from '@marxan-api/modules/projects/project.api.entity';
import { CommandBus } from '@nestjs/cqrs';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';

/**
 * Utility functions for tests related to Projects.
 *
 * Hopefully helping to reduce some boilerplate in operations that need to be
 * carried out throughout tests.
 *
 * Create functions return the raw response body - no need to assert anything
 * here as these utility functions mainly do some work at the edge of what is
 * actually being tested.
 */
export class ProjectsTestUtils {
  static async createProject(
    app: INestApplication,
    jwtToken: string,
    projectDTO: Partial<CreateProjectDTO>,
  ): Promise<ProjectResultSingular> {
    return await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(projectDTO)
      .then((response) => response.body)
      .catch((error) => {
        Logger.error(error);
      });
  }
  static async generateBlmValues(app: INestApplication, projectId: string) {
    const commandBus = app.get(CommandBus);
    await commandBus.execute(new SetProjectBlm(projectId));
  }

  static async deleteProject(
    app: INestApplication,
    jwtToken: string,
    id: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/api/v1/projects/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`);
  }
}
