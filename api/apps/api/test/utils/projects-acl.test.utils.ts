import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

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
export class ProjectsACLTestUtils {
  static async deleteUserFromProject(
    app: INestApplication,
    jwtToken: string,
    projectId: string,
    userId: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/api/v1/roles/projects/${projectId}/users/${userId}`)
      .set('Authorization', `Bearer ${jwtToken}`);
  }
}
