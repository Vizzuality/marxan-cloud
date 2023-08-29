import { PartialType } from '@nestjs/swagger';
import { CreateCostSurfaceDto } from '@marxan-api/modules/cost-surface/dto/create-cost-surface.dto';

export class UpdateCostSurfaceDto extends PartialType(CreateCostSurfaceDto) {}
