import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { ArchiveLocation } from '../../../../../../../libs/cloning/src/domain';
import { apiGlobalPrefixes } from '../../../../api.config';
import { ExportEntity } from '../../export/adapters/entities/exports.api.entity';
import { ImportArchive } from './import-archive';

@Controller(`${apiGlobalPrefixes.v1}/foo`)
export class FooController {
  constructor(
    private importArchive: ImportArchive,
    @InjectRepository(ExportEntity)
    private exportRepo: Repository<ExportEntity>,
  ) {}

  @Post('import/:exportId')
  async startImport(
    @Param('exportId', ParseUUIDPipe) exportId: string,
  ): Promise<void> {
    const exportInstance = await this.exportRepo.findOneOrFail(exportId);

    if (!exportInstance.archiveLocation) throw new BadRequestException();

    const result = await this.importArchive.import(
      new ArchiveLocation(exportInstance.archiveLocation),
    );

    if (isLeft(result)) throw new InternalServerErrorException();
  }
}
