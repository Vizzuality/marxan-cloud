import { BadRequestException, Controller, Post } from '@nestjs/common';
import { Facade } from './facade';

@Controller()
export class SomeController {
  constructor(private readonly facade: Facade) {}

  @Post()
  async doThings() {
    const result = await this.facade.doComposedAction();

    if (result) {
      return { success: true };
    } else {
      throw new BadRequestException();
    }
  }
}
