import { Controller, Post } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  ComponentId,
  ClonePiece,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { apiGlobalPrefixes } from '../../../../api.config';
import { ImportId, PieceImportRequested } from '../domain';

const basePath = `${apiGlobalPrefixes.v1}/foo`;

@Controller(basePath)
export class FooController {
  constructor(private eventBus: EventBus) {}

  @Post()
  async create(): Promise<void> {
    this.eventBus.publish(
      new PieceImportRequested(
        ImportId.create(),
        ComponentId.create(),
        ClonePiece.ProjectMetadata,
        ResourceId.create(),
        ResourceKind.Project,
        [],
      ),
    );
  }
}
