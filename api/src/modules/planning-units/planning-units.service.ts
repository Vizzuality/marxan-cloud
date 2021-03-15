import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';
import { UpdatePlanningUnitsDTO } from './dto/update.planning-units.dto';

import * as faker from 'faker';
import { InjectQueue } from '@nestjs/bull';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class PlanningUnitsService {
  constructor(
    @InjectQueue('planning-units') private readonly planningUnitsQueue: Queue,
  ) {}

  public async create() {
    await this.planningUnitsQueue.add('transcode', {
      file: 'audio.mp3',
    });
  }
}
