import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Module, OnModuleInit } from '@nestjs/common';
import {
  ImportPieceProcessor,
  ImportPieceProcessorProvider,
} from './import-piece-processor';
import { ImportPiecesProvider } from './import-pieces.provider';

@Module({
  imports: [DiscoveryModule],
  providers: [ImportPiecesProvider],
  exports: [ImportPiecesProvider],
})
export class ImportPiecesModule implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly providers: ImportPiecesProvider,
  ) {}

  async onModuleInit() {
    const pieceImportersProviders = await this.discovery.providersWithMetaAtKey<symbol>(
      ImportPieceProcessorProvider,
    );

    // TODO: should ensure this is a class instance that implements PieceProcessor
    // shouldn't happen tho if decorator is used as intended.
    pieceImportersProviders.forEach((provider) =>
      this.providers.registerProvider(
        provider.discoveredClass.instance as ImportPieceProcessor,
      ),
    );
  }
}
