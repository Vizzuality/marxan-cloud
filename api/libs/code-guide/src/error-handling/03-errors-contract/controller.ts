import { Controller, Post } from '@nestjs/common';
import { Facade } from './facade';
import { Serializer } from './serializer';

@Controller()
export class SomeController {
  constructor(
    private readonly facade: Facade,
    private readonly serializer: Serializer,
  ) {}

  @Post()
  async doThings() {
    const result = await this.facade.doComposedAction();
    this.serializer.map(result);
  }
}
