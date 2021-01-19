import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { BaseService } from 'nestjs-base-service';
import { Repository } from 'typeorm';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';

import JSONAPISerializer = require('jsonapi-serializer');

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class ProjectsService extends BaseService<
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Project)
    protected readonly repository: Repository<Project>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(repository, 'project');
    this.serializer = new JSONAPISerializer.Serializer('projects', {
      attributes: ['name', 'description', 'users'],
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
  }

  serializer;

  async serialize(entities: Project[]) {
    return this.serializer.serialize(entities);
  }

  async fakeFindOne(_id: string): Promise<Project> {
    const project = {
      ...new Project(),
      id: faker.random.uuid(),
      name: faker.lorem.words(5),
      description: faker.lorem.sentence(),
      users: await Promise.all(
        Array.from({ length: 10 }).map(
          async (_userId) =>
            await this.usersService.fakeFindOne(faker.random.uuid()),
        ),
      ),
    };
    return project;
  }

  async findAll(): Promise<Project[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Project | undefined> {
    return this.repository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
