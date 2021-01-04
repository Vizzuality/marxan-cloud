import { Controller, Get } from '@nestjs/common';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

import JSONAPISerializer = require('jsonapi-serializer');

@Controller('projects')
export class ProjectsController {
  constructor(public readonly service: ProjectsService) {}

  @Get()
  async findAll(): Promise<Project[]> {
    const serializer = new JSONAPISerializer.Serializer('projects', {
      attributes: ['name', 'users'],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email', 'projectRoles'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
    });
    return serializer.serialize(await this.service.findAll());
  }
}
