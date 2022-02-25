import { Controller, Get } from '@nestjs/common';

@Controller('/api/ping')
export class PingController {
  @Get()
  ping(): { ping: string } {
    return { ping: 'pong' };
  }
}
