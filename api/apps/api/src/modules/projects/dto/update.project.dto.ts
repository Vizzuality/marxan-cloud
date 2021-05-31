import { PartialType } from '@nestjs/swagger';
import { CreateProjectDTO } from './create.project.dto';

export class UpdateProjectDTO extends PartialType(CreateProjectDTO) {}
