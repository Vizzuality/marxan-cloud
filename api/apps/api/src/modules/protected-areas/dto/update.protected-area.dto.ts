import { PartialType } from '@nestjs/swagger';
import { CreateProtectedAreaDTO } from './create.protected-area.dto';

export class UpdateProtectedAreaDTO extends PartialType(
  CreateProtectedAreaDTO,
) {}
