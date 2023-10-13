import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Module, OnModuleInit } from '@nestjs/common';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorToken,
} from './legacy-project-import-piece-processor';
import { LegacyProjectImportPiecesProvider } from './legacy-project-import-pieces.provider';

@Module({
  imports: [DiscoveryModule],
  providers: [LegacyProjectImportPiecesProvider],
  exports: [LegacyProjectImportPiecesProvider],
})
export class LegacyProjectImportPiecesModule implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly providers: LegacyProjectImportPiecesProvider,
  ) {}

  async onModuleInit() {
    const legacyProjectPieceImporterProviders =
      await this.discovery.providersWithMetaAtKey<symbol>(
        LegacyProjectImportPieceProcessorToken,
      );

    // TODO: should ensure this is a class instance that implements PieceProcessor
    // shouldn't happen tho if decorator is used as intended.
    legacyProjectPieceImporterProviders.forEach((provider) =>
      this.providers.registerProvider(
        provider.discoveredClass.instance as LegacyProjectImportPieceProcessor,
      ),
    );
  }
}
