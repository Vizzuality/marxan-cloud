"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const helmet = require("helmet");
const cors_utils_1 = require("./utils/cors.utils");
const config_utils_1 = require("./utils/config.utils");
const common_1 = require("@nestjs/common");
const all_exceptions_exception_filter_1 = require("./filters/all-exceptions.exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    if (!config_utils_1.AppConfig.get('auth.jwt.secret')) {
        throw new Error('No secret configured for the signing of JWT tokens. Please set the `API_AUTH_JWT_SECRET` environment variable.');
    }
    app.use(helmet());
    app.enableCors({
        allowedHeaders: 'Content-Type,Authorization,Content-Disposition',
        exposedHeaders: 'Authorization',
        origin: cors_utils_1.CorsUtils.originHandler,
    });
    const swaggerOptions = new swagger_1.DocumentBuilder()
        .setTitle('MarxanCloud API')
        .setDescription('MarxanCloud is a conservation planning platform.')
        .setVersion(process.env.npm_package_version || 'development')
        .addBearerAuth({
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
    })
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerOptions);
    swagger_1.SwaggerModule.setup('/swagger', app, swaggerDocument);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map