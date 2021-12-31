import { Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';

import { PieceProcessor, PieceProcessorProvider } from './piece-processor';
import { PiecesProvider } from './pieces.provider';

@Module({
  imports: [DiscoveryModule],
  providers: [PiecesProvider],
  exports: [PiecesProvider],
})
export class PiecesModule implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly providers: PiecesProvider,
  ) {}

  async onModuleInit() {
    const pieceExportersProviders = await this.discovery.providersWithMetaAtKey<symbol>(
      PieceProcessorProvider,
    );

    // TODO: should ensure this is a class instance that implements PieceProcessor
    // shouldn't happen tho if decorator is used as intended.
    pieceExportersProviders.forEach((provider) =>
      this.providers.registerProvider(
        provider.discoveredClass.instance as PieceProcessor,
      ),
    );
  }
}
