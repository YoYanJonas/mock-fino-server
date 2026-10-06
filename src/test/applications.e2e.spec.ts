import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { ApplicationsRepository } from '../applications/applications.repository';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('Applications API', () => {
  let app: INestApplication<App>;
  let repository: ApplicationsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    repository = app.get(ApplicationsRepository);
    repository.reset();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a new draft application', async () => {
    const response = await request(app.getHttpServer()).post('/api/applications').send({});

    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(/^APP-\d+$/);
    expect(response.body.status).toBe('DRAFT');
    expect(response.body.data).toBeDefined();
    expect(response.body.completionPercentage).toBe(0);
  });

  it('returns an existing application', async () => {
    const response = await request(app.getHttpServer()).get('/api/applications/APP-10043');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('APP-10043');
    expect(response.body.data.legalName).toBe('Northstar Labs Ltd');
  });

  it('returns 404 for unknown application', async () => {
    const response = await request(app.getHttpServer()).get('/api/applications/APP-99999');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('lists applications with search and status filters', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/applications?search=Northstar&status=DRAFT',
    );
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThanOrEqual(1);
    expect(response.body.items[0].businessName).toContain('Northstar');
  });

  it('partially updates a draft and preserves existing fields', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/applications/APP-10043')
      .send({ data: { website: 'https://updated.example' } });

    expect(response.status).toBe(200);
    expect(response.body.data.website).toBe('https://updated.example');
    expect(response.body.data.legalName).toBe('Northstar Labs Ltd');
    expect(response.body.data.registeredAddress.city).toBe('Milan');
  });

  it('returns 404 when updating a nonexistent application', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/applications/APP-99999')
      .send({ data: { legalName: 'Nope' } });
    expect(response.status).toBe(404);
  });

  it('rejects updates to submitted applications', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/applications/APP-10045')
      .send({ data: { legalName: 'Changed' } });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('rejects submit when owners are missing', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: {
          businessType: 'SOLE_TRADER',
          legalName: 'Solo',
          country: 'IT',
          incorporationDate: '2020-01-01',
          industry: 'SOFTWARE',
          monthlyTransactionVolume: 'UNDER_10K',
          registeredAddress: {
            addressLine1: '1',
            city: 'Milan',
            postalCode: '20100',
            country: 'IT',
          },
          primaryContact: { fullName: 'A', email: 'a@example.com', phone: '+1' },
          signatories: [{ fullName: 'A', email: 'a@example.com', role: 'Owner' }],
          accountPurposes: ['PAYMENTS'],
          confirmationAccepted: true,
        },
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields.owners).toBeDefined();
  });

  it('rejects ownership total not equal to 100', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: validBasePayload({
          owners: [
            {
              fullName: 'A',
              dateOfBirth: '1990-01-01',
              country: 'IT',
              email: 'a@example.com',
              ownershipPercentage: 40,
            },
            {
              fullName: 'B',
              dateOfBirth: '1991-01-01',
              country: 'IT',
              email: 'b@example.com',
              ownershipPercentage: 40,
            },
          ],
        }),
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields.owners).toMatch(/100/);
  });

  it('rejects duplicate owner emails', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: validBasePayload({
          owners: [
            {
              fullName: 'A',
              dateOfBirth: '1990-01-01',
              country: 'IT',
              email: 'dup@example.com',
              ownershipPercentage: 50,
            },
            {
              fullName: 'B',
              dateOfBirth: '1991-01-01',
              country: 'IT',
              email: 'dup@example.com',
              ownershipPercentage: 50,
            },
          ],
        }),
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields['owners.1.email']).toMatch(/Duplicate/i);
  });

  it('rejects missing signatory', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: validBasePayload({
          signatories: [],
        }),
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields.signatories).toBeDefined();
  });

  it('rejects missing confirmation', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: validBasePayload({
          confirmationAccepted: false,
        }),
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields.confirmationAccepted).toBeDefined();
  });

  it('rejects international transfers without volume', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: validBasePayload({
          accountPurposes: ['INTERNATIONAL_TRANSFERS'],
          expectedInternationalTransferVolume: null,
        }),
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields.expectedInternationalTransferVolume).toBeDefined();
  });

  it('rejects high volume without source of funds', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({
        data: validBasePayload({
          monthlyTransactionVolume: 'ABOVE_250K',
          sourceOfFunds: null,
        }),
      });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(422);
    expect(response.body.error.fields.sourceOfFunds).toBeDefined();
  });

  it('submits a valid application', async () => {
    const created = await request(app.getHttpServer()).post('/api/applications').send({});
    const id = created.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/applications/${id}`)
      .send({ data: validBasePayload({}) });

    const response = await request(app.getHttpServer()).post(`/api/applications/${id}/submit`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('SUBMITTED');
  });

  it('returns conflict when submitting an already submitted application', async () => {
    const response = await request(app.getHttpServer()).post('/api/applications/APP-10045/submit');
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });
});

function validBasePayload(overrides: Record<string, unknown>) {
  return {
    businessType: 'SOLE_TRADER',
    legalName: 'Valid Co',
    country: 'IT',
    incorporationDate: '2020-01-01',
    industry: 'SOFTWARE',
    monthlyTransactionVolume: 'UNDER_10K',
    registeredAddress: {
      addressLine1: '1 Road',
      city: 'Milan',
      postalCode: '20100',
      country: 'IT',
    },
    operatingAddressDifferent: false,
    primaryContact: {
      fullName: 'Valid User',
      email: 'valid@example.com',
      phone: '+39000',
    },
    owners: [
      {
        fullName: 'Valid User',
        dateOfBirth: '1990-01-01',
        country: 'IT',
        email: 'valid@example.com',
        ownershipPercentage: 100,
      },
    ],
    signatories: [
      {
        fullName: 'Valid User',
        email: 'valid@example.com',
        role: 'Owner',
      },
    ],
    accountPurposes: ['PAYMENTS'],
    confirmationAccepted: true,
    ...overrides,
  };
}
