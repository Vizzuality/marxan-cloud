import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Module, OnModuleInit } from '@nestjs/common';
import {
  ExportPieceProcessor,
  ExportPieceProcessorProvider,
} from './export-piece-processor';
import { ExportPiecesProvider } from './export-pieces.provider';

@Module({
  imports: [DiscoveryModule],
  providers: [ExportPiecesProvider],
  exports: [ExportPiecesProvider],
})
export class ExportPiecesModule implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly providers: ExportPiecesProvider,
  ) {}

  async onModuleInit() {
    const pieceExportersProviders = await this.discovery.providersWithMetaAtKey<symbol>(
      ExportPieceProcessorProvider,
    );

    // TODO: should ensure this is a class instance that implements PieceProcessor
    // shouldn't happen tho if decorator is used as intended.
    pieceExportersProviders.forEach((provider) =>
      this.providers.registerProvider(
        provider.discoveredClass.instance as ExportPieceProcessor,
      ),
    );
  }
}
