import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function addSwagger(app: INestApplication): OpenAPIObject {
  const swaggerOptions = new DocumentBuilder()
    .setTitle('MarxanCloud API')
    .setDescription('MarxanCloud is a conservation planning platform.')
    .setVersion(process.env.npm_package_version || 'development')
    .addBearerAuth({
      type: 'http',
    })
    .build();

  return SwaggerModule.createDocument(app, swaggerOptions);
}
