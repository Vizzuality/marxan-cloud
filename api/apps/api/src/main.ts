import { bootstrapSetUp } from '@marxan-api/bootstrap-app';
import { addSwagger } from '@marxan-api/add-swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';

config({
  path: '.env',
});

export async function bootstrap() {
  const app = await bootstrapSetUp();
  const swaggerDocument = addSwagger(app);

  SwaggerModule.setup('/swagger', app, swaggerDocument);

  await app.listen(3000);
}

bootstrap();
