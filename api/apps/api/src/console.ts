import { BootstrapConsole, ConsoleModule } from 'nestjs-console';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { AuthenticationModule } from '@marxan-api/modules/authentication/authentication.module';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { UserCommand } from '@marxan-api/modules/users/user.command';
import { FetchSpecificationMiddleware } from 'nestjs-base-service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...apiConnections.default,
      keepConnectionAlive: true,
    }),
    AuthenticationModule,
    ConsoleModule,
    UsersModule,
  ],
  providers: [UserCommand],
  exports: [UserCommand],
})
export class AppModule implements NestModule {
  /**
   * @todo Apply middleware more surgically; probably rename it to something
   * more generic (e.g. `FetchSpecificationMiddleware`?).
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FetchSpecificationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}

const bootstrap = new BootstrapConsole({
  module: AppModule,
  useDecorators: true,
});
bootstrap.init().then(async (app) => {
  try {
    await app.init();
    await bootstrap.boot();
    await app.close();
  } catch (e) {
    console.error(e);
    await app.close();
    process.exit(1);
  }
});
