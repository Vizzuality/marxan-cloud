import { Controller, Get } from '@nestjs/common';

@Controller('ping')
export class PingController {
  @Get()
  ping(): { ping: string } {
    return { ping: 'pong' };
  }
}
