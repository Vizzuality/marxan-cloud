import { Command } from '@nestjs-architects/typed-cqrs';
import { BBox } from 'geojson';
import { CostSurfaceId, ProjectId } from './project.id';

export class SetProjectGridFromShapefile extends Command<void> {
  constructor(
    public readonly projectId: ProjectId,
    public readonly costSurfaceId: CostSurfaceId,
    public readonly planningAreaId: string,
    public readonly bbox: BBox,
  ) {
    super();
  }
}
