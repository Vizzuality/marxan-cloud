import { ClonePiece, ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { ResourceId } from '../../src/modules/clone/export';
import { ComponentLocationEntity } from '../../src/modules/clone/export/adapters/entities/component-locations.api.entity';
import { ExportComponentEntity } from '../../src/modules/clone/export/adapters/entities/export-components.api.entity';
import { ExportEntity } from '../../src/modules/clone/export/adapters/entities/exports.api.entity';
import { TypeormExportRepository } from '../../src/modules/clone/export/adapters/typeorm-export.repository';
import { ComponentLocation } from '../../src/modules/clone/export/application/complete-piece.command';
import { ExportRepository } from '../../src/modules/clone/export/application/export-repository.port';
import { Export, ExportId } from '../../src/modules/clone/export/domain';
import { apiConnections } from '../../src/ormconfig';

describe('Typeorm export repository', () => {
  let repo: ExportRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(apiConnections.default),
        TypeOrmModule.forFeature([
          ExportEntity,
          ExportComponentEntity,
          ComponentLocationEntity,
        ]),
      ],
      providers: [
        {
          provide: ExportRepository,
          useClass: TypeormExportRepository,
        },
      ],
    }).compile();

    repo = module.get<ExportRepository>(ExportRepository);
  }, 100000);

  it('should expose methods for getting an export by id and storing exports', async () => {
    expect(repo.find(new ExportId(v4()))).resolves.toBe(undefined);

    const resourceId = new ResourceId(v4());
    const componentId = new ComponentId(v4());
    const componentLocationUri = '/foo/bar/project-metadata.json';
    const componentLocationRelativePath = 'project-metadata.json';
    const exportInstance = Export.newOne(resourceId, ResourceKind.Project, [
      {
        finished: false,
        piece: ClonePiece.ProjectMetadata,
        resourceId: resourceId.value,
        id: componentId,
        uri: [
          new ComponentLocation(
            componentLocationUri,
            componentLocationRelativePath,
          ),
        ],
      },
    ]);
    await repo.save(exportInstance);

    const result = await repo.find(exportInstance.id);

    expect(result).toBeDefined();
    expect(result!.id).toBe(exportInstance.id);
    expect(result!.resourceKind).toBe(ResourceKind.Project);
    expect(result!.resourceId).toBe(resourceId);

    const resultSnapshot = result!.toSnapshot();

    expect(resultSnapshot.exportPieces).toHaveLength(1);

    const [exportComponent] = resultSnapshot.exportPieces;

    expect(exportComponent.finished).toBe(false);
    expect(exportComponent.piece).toBe(ClonePiece.ProjectMetadata);
    expect(exportComponent.resourceId).toBe(resourceId.value);
    expect(exportComponent.uri).toHaveLength(1);
    expect(exportComponent.uri![0].uri).toBe(componentLocationUri);
    expect(exportComponent.uri![0].relativePath).toBe(
      componentLocationRelativePath,
    );
  });
});
