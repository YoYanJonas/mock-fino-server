import { calculateCompletion } from '../applications/completion';
import { emptyApplicationData, ApplicationData } from '../applications/application.types';

describe('completion unit', () => {
  it('returns 0% and step 1 for empty data', () => {
    const result = calculateCompletion(emptyApplicationData());
    expect(result.completionPercentage).toBe(0);
    expect(result.currentStep).toBe(1);
  });

  it('is deterministic for a complete application', () => {
    const data: ApplicationData = {
      ...emptyApplicationData(),
      businessType: 'SOLE_TRADER',
      legalName: 'Acme',
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
        fullName: 'A B',
        email: 'a@example.com',
        phone: '+39000',
      },
      owners: [
        {
          fullName: 'A B',
          dateOfBirth: '1990-01-01',
          country: 'IT',
          email: 'a@example.com',
          ownershipPercentage: 100,
        },
      ],
      signatories: [{ fullName: 'A B', email: 'a@example.com', role: 'Owner' }],
      accountPurposes: ['PAYMENTS'],
      confirmationAccepted: true,
    };

    expect(calculateCompletion(data)).toEqual(calculateCompletion(data));
    expect(calculateCompletion(data).completionPercentage).toBe(100);
    expect(calculateCompletion(data).currentStep).toBe(8);
  });
});
