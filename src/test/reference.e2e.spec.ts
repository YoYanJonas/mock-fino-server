import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('Reference API', () => {
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

  it('returns countries', async () => {
    const response = await request(app.getHttpServer()).get('/api/reference/countries');
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThanOrEqual(10);
    expect(response.body.items.some((item: { code: string }) => item.code === 'IT')).toBe(true);
  });

  it('returns industries', async () => {
    const response = await request(app.getHttpServer()).get('/api/reference/industries');
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(5);
  });

  it('returns transfer countries', async () => {
    const response = await request(app.getHttpServer()).get('/api/reference/transfer-countries');
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(10);
  });
});
