import { bootstrapSetUp } from '@marxan-api/bootstrap-app';
import { addSwagger } from '@marxan-api/add-swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';

process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
});

process.on('uncaughtException', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log('uncaughtException', error);
});

export async function bootstrap() {
  const app = await bootstrapSetUp();
  const events = new Logger('events');
  const commands = new Logger('commands');

  const eBus = app.get(EventBus);
  const cBus = app.get(CommandBus);
  eBus.subscribe((event) => events.log(`event` + JSON.stringify(event)));
  cBus.subscribe((event) => commands.log(`cmd` + JSON.stringify(event)));

  const swaggerDocument = addSwagger(app);

  SwaggerModule.setup('/swagger', app, swaggerDocument);

  await app.listen(3000);
}

bootstrap();
