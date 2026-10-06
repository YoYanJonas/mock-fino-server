export type ApplicationStatus = 'DRAFT' | 'SUBMITTED';

export type BusinessType = 'LIMITED_COMPANY' | 'SOLE_TRADER' | 'PARTNERSHIP';

export type MonthlyVolume = 'UNDER_10K' | '10K_TO_50K' | '50K_TO_250K' | 'ABOVE_250K';

export interface Address {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  fullName: string;
  email: string;
  phone: string;
}

export interface BeneficialOwner {
  fullName: string;
  dateOfBirth: string;
  country: string;
  email: string;
  ownershipPercentage: number;
}

export interface Signatory {
  fullName: string;
  email: string;
  role: string;
}

export interface ApplicationData {
  businessType: BusinessType | null;
  legalName: string | null;
  registrationNumber: string | null;
  country: string | null;
  incorporationDate: string | null;
  industry: string | null;
  website: string | null;
  monthlyTransactionVolume: MonthlyVolume | null;
  sourceOfFunds: string | null;
  registeredAddress: Address | null;
  operatingAddressDifferent: boolean | null;
  operatingAddress: Address | null;
  primaryContact: Contact | null;
  owners: BeneficialOwner[];
  signatories: Signatory[];
  accountPurposes: string[];
  transferCountries: string[];
  expectedInternationalTransferVolume: string | null;
  additionalInformation: string | null;
  confirmationAccepted: boolean | null;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  currentStep: number;
  completionPercentage: number;
  createdAt: string;
  lastUpdatedAt: string;
  data: ApplicationData;
}

export interface ApplicationSummary {
  id: string;
  status: ApplicationStatus;
  businessName: string | null;
  country: string | null;
  currentStep: number;
  completionPercentage: number;
  lastUpdatedAt: string;
}

export function emptyApplicationData(): ApplicationData {
  return {
    businessType: null,
    legalName: null,
    registrationNumber: null,
    country: null,
    incorporationDate: null,
    industry: null,
    website: null,
    monthlyTransactionVolume: null,
    sourceOfFunds: null,
    registeredAddress: null,
    operatingAddressDifferent: null,
    operatingAddress: null,
    primaryContact: null,
    owners: [],
    signatories: [],
    accountPurposes: [],
    transferCountries: [],
    expectedInternationalTransferVolume: null,
    additionalInformation: null,
    confirmationAccepted: null,
  };
}
