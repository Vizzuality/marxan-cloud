import { UnusedResources } from '@marxan/unused-resources-cleanup';
import { InjectRepository } from '@nestjs/typeorm';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { Repository } from 'typeorm';

export class CostSurfaceUnusedResources implements UnusedResources<void> {
  constructor(
    @InjectRepository(CostSurfacePuDataEntity)
    private readonly costSurfacePURepo: Repository<CostSurfacePuDataEntity>,
  ) {}

  async removeUnusedResources(resourceId: string, data: void): Promise<void> {
    await this.costSurfacePURepo.delete({ costSurfaceId: resourceId });
  }
}
