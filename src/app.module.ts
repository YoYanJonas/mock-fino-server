import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MockScenarioMiddleware } from './common/middleware/mock-scenario.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MockScenarioMiddleware).forRoutes('*');
  }
}
