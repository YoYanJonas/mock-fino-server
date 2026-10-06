import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('Mock scenarios', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns server-error', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/applications')
      .set('X-Mock-Scenario', 'server-error');
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns validation-error', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/applications')
      .set('X-Mock-Scenario', 'validation-error');
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields.legalName).toBeDefined();
  });

  it('returns conflict', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/applications')
      .set('X-Mock-Scenario', 'conflict');
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('applies slow delay', async () => {
    const started = Date.now();
    const response = await request(app.getHttpServer())
      .get('/api/reference/countries')
      .set('X-Mock-Scenario', 'slow');
    const elapsed = Date.now() - started;
    expect(response.status).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(2000);
  }, 10000);
});
