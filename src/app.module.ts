import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApplicationsModule } from './applications/applications.module';
import { MockScenarioMiddleware } from './common/middleware/mock-scenario.middleware';
import { ReferenceModule } from './reference/reference.module';

@Module({
  imports: [ApplicationsModule, ReferenceModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MockScenarioMiddleware).forRoutes('*');
  }
}
