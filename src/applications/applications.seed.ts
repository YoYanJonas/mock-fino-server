import {
  Application,
  emptyApplicationData,
  ApplicationData,
} from './application.types';
import { calculateCompletion } from './completion';

function withCompletion(data: ApplicationData, base: Omit<Application, 'currentStep' | 'completionPercentage' | 'data'> & { data: ApplicationData }): Application {
  const { currentStep, completionPercentage } = calculateCompletion(data);
  return {
    ...base,
    data,
    currentStep,
    completionPercentage,
  };
}

export function seedApplications(): { applications: Application[]; nextId: number } {
  const draftEmptyData = emptyApplicationData();
  const draftEmpty = withCompletion(draftEmptyData, {
    id: 'APP-10042',
    status: 'DRAFT',
    createdAt: '2026-09-01T10:00:00.000Z',
    lastUpdatedAt: '2026-09-01T10:00:00.000Z',
    data: draftEmptyData,
  });

  const midData: ApplicationData = {
    ...emptyApplicationData(),
    businessType: 'LIMITED_COMPANY',
    legalName: 'Northstar Labs Ltd',
    registrationNumber: 'NL-349102',
    country: 'IT',
    incorporationDate: '2020-04-15',
    industry: 'SOFTWARE',
    website: 'https://northstar.example',
    monthlyTransactionVolume: '10K_TO_50K',
    registeredAddress: {
      addressLine1: '10 Main Street',
      city: 'Milan',
      postalCode: '20100',
      country: 'IT',
    },
    operatingAddressDifferent: false,
    primaryContact: {
      fullName: 'Jane Doe',
      email: 'jane@northstar.example',
      phone: '+390000000000',
    },
  };
  const midDraft = withCompletion(midData, {
    id: 'APP-10043',
    status: 'DRAFT',
    createdAt: '2026-09-10T09:00:00.000Z',
    lastUpdatedAt: '2026-10-06T17:32:10.000Z',
    data: midData,
  });

  const multiData: ApplicationData = {
    ...emptyApplicationData(),
    businessType: 'PARTNERSHIP',
    legalName: 'Horizon Partners GmbH',
    registrationNumber: 'HRB-88210',
    country: 'DE',
    incorporationDate: '2018-11-02',
    industry: 'CONSULTING',
    website: 'https://horizon.example',
    monthlyTransactionVolume: '50K_TO_250K',
    registeredAddress: {
      addressLine1: 'Unter den Linden 1',
      city: 'Berlin',
      postalCode: '10117',
      country: 'DE',
    },
    operatingAddressDifferent: true,
    operatingAddress: {
      addressLine1: 'Friedrichstrasse 88',
      city: 'Berlin',
      postalCode: '10117',
      country: 'DE',
    },
    primaryContact: {
      fullName: 'Klaus Weber',
      email: 'klaus@horizon.example',
      phone: '+49300000000',
    },
    owners: [
      {
        fullName: 'Klaus Weber',
        dateOfBirth: '1980-03-12',
        country: 'DE',
        email: 'klaus@horizon.example',
        ownershipPercentage: 60,
      },
      {
        fullName: 'Maria Rossi',
        dateOfBirth: '1985-07-22',
        country: 'IT',
        email: 'maria@horizon.example',
        ownershipPercentage: 40,
      },
    ],
    signatories: [
      {
        fullName: 'Klaus Weber',
        email: 'klaus@horizon.example',
        role: 'Managing Partner',
      },
      {
        fullName: 'Maria Rossi',
        email: 'maria@horizon.example',
        role: 'Partner',
      },
    ],
    accountPurposes: ['PAYMENTS', 'INTERNATIONAL_TRANSFERS'],
    transferCountries: ['IT', 'FR', 'US'],
    expectedInternationalTransferVolume: '10K_TO_50K',
  };
  const multiDraft = withCompletion(multiData, {
    id: 'APP-10044',
    status: 'DRAFT',
    createdAt: '2026-08-20T08:00:00.000Z',
    lastUpdatedAt: '2026-10-05T12:00:00.000Z',
    data: multiData,
  });

  const submittedData: ApplicationData = {
    ...emptyApplicationData(),
    businessType: 'SOLE_TRADER',
    legalName: 'Blue Orchid Studio',
    country: 'GB',
    incorporationDate: '2019-01-10',
    industry: 'DESIGN',
    website: 'https://blueorchid.example',
    monthlyTransactionVolume: 'UNDER_10K',
    registeredAddress: {
      addressLine1: '42 King Street',
      city: 'London',
      postalCode: 'W1B 5AG',
      country: 'GB',
    },
    operatingAddressDifferent: false,
    primaryContact: {
      fullName: 'Alex Morgan',
      email: 'alex@blueorchid.example',
      phone: '+442000000000',
    },
    owners: [
      {
        fullName: 'Alex Morgan',
        dateOfBirth: '1990-05-01',
        country: 'GB',
        email: 'alex@blueorchid.example',
        ownershipPercentage: 100,
      },
    ],
    signatories: [
      {
        fullName: 'Alex Morgan',
        email: 'alex@blueorchid.example',
        role: 'Owner',
      },
    ],
    accountPurposes: ['PAYMENTS'],
    confirmationAccepted: true,
  };
  const submitted = withCompletion(submittedData, {
    id: 'APP-10045',
    status: 'SUBMITTED',
    createdAt: '2026-07-01T10:00:00.000Z',
    lastUpdatedAt: '2026-07-15T14:30:00.000Z',
    data: submittedData,
  });

  return {
    applications: [draftEmpty, midDraft, multiDraft, submitted],
    nextId: 10046,
  };
}
