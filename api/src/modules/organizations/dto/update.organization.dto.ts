import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationDTO } from './create.organization.dto';

export class UpdateOrganizationDTO extends PartialType(CreateOrganizationDTO) {}
