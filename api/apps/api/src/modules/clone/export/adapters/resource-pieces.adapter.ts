import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable, SetMetadata } from '@nestjs/common';
import { ResourcePieces } from '../application/resource-pieces.port';
import { ExportComponentSnapshot } from '../domain';

export const ResourcePiecesProviderMetadata = Symbol(
  `Resource pieces provider`,
);

export const ResourcePiecesProvider = (kind: ResourceKind) =>
  SetMetadata(ResourcePiecesProviderMetadata, kind);

@Injectable()
export class ResourcePiecesAdapter implements ResourcePieces {
  constructor(private readonly discovery: DiscoveryService) {}

  private async getAdapterFor(kind: ResourceKind): Promise<ResourcePieces> {
    const resourcePiecesProviders = await this.discovery.providersWithMetaAtKey<ResourceKind>(
      ResourcePiecesProviderMetadata,
    );

    const resourcePiecesProvider = resourcePiecesProviders.find(
      (provider) => provider.meta === kind,
    );

    if (!resourcePiecesProvider) {
      throw new Error(`ResourcePieces adapter not found for ${kind}`);
    }

    return resourcePiecesProvider.discoveredClass.instance as ResourcePieces;
  }

  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponentSnapshot[]> {
    const adapter = await this.getAdapterFor(kind);

    return adapter.resolveFor(id, kind);
  }
}
