import { bootstrapSetUp } from '@marxan-api/bootstrap-app';
import { addSwagger } from '@marxan-api/add-swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from '@marxan-api/utils/config.utils';

export async function bootstrap() {
  const app = await bootstrapSetUp();

  const swaggerDocument = addSwagger(app);

  SwaggerModule.setup('/swagger', app, swaggerDocument);

  await app.listen(AppConfig.get('api.port', 3000));
}

bootstrap();
