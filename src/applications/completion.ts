import { ApplicationData, Address, Contact, BeneficialOwner, Signatory } from './application.types';

const TOTAL_STEPS = 8;

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCompleteAddress(address: Address | null | undefined): boolean {
  if (!address) {
    return false;
  }
  return (
    hasText(address.addressLine1) &&
    hasText(address.city) &&
    hasText(address.postalCode) &&
    hasText(address.country)
  );
}

function isCompleteContact(contact: Contact | null | undefined): boolean {
  if (!contact) {
    return false;
  }
  return hasText(contact.fullName) && hasText(contact.email) && hasText(contact.phone);
}

function isCompleteOwner(owner: BeneficialOwner): boolean {
  return (
    hasText(owner.fullName) &&
    hasText(owner.dateOfBirth) &&
    hasText(owner.country) &&
    hasText(owner.email) &&
    Number.isInteger(owner.ownershipPercentage) &&
    owner.ownershipPercentage > 0 &&
    owner.ownershipPercentage <= 100
  );
}

function isCompleteSignatory(signatory: Signatory): boolean {
  return hasText(signatory.fullName) && hasText(signatory.email) && hasText(signatory.role);
}

function uniqueEmails(emails: string[]): boolean {
  const normalized = emails.map((email) => email.trim().toLowerCase());
  return new Set(normalized).size === normalized.length;
}

export function isBusinessInfoComplete(data: ApplicationData): boolean {
  const base =
    data.businessType !== null &&
    hasText(data.legalName) &&
    hasText(data.country) &&
    hasText(data.incorporationDate) &&
    hasText(data.industry) &&
    data.monthlyTransactionVolume !== null;

  if (!base) {
    return false;
  }

  if (data.businessType === 'SOLE_TRADER') {
    return true;
  }

  return hasText(data.registrationNumber);
}

export function isAddressContactComplete(data: ApplicationData): boolean {
  if (!isCompleteAddress(data.registeredAddress) || !isCompleteContact(data.primaryContact)) {
    return false;
  }
  if (data.operatingAddressDifferent === true) {
    return isCompleteAddress(data.operatingAddress);
  }
  return true;
}

export function isOwnersComplete(data: ApplicationData): boolean {
  if (data.owners.length < 1) {
    return false;
  }
  if (!data.owners.every(isCompleteOwner)) {
    return false;
  }
  if (!uniqueEmails(data.owners.map((owner) => owner.email))) {
    return false;
  }
  const total = data.owners.reduce((sum, owner) => sum + owner.ownershipPercentage, 0);
  return total === 100;
}

export function isSignatoriesComplete(data: ApplicationData): boolean {
  if (data.signatories.length < 1) {
    return false;
  }
  if (!data.signatories.every(isCompleteSignatory)) {
    return false;
  }
  return uniqueEmails(data.signatories.map((signatory) => signatory.email));
}

export function isBankingComplete(data: ApplicationData): boolean {
  if (data.accountPurposes.length < 1) {
    return false;
  }
  if (data.accountPurposes.includes('INTERNATIONAL_TRANSFERS')) {
    return hasText(data.expectedInternationalTransferVolume);
  }
  return true;
}

export function isSourceOfFundsComplete(data: ApplicationData): boolean {
  if (data.monthlyTransactionVolume === null) {
    return false;
  }
  if (data.monthlyTransactionVolume === 'ABOVE_250K') {
    return hasText(data.sourceOfFunds);
  }
  return true;
}

export function isReviewComplete(data: ApplicationData): boolean {
  return data.confirmationAccepted === true;
}

export function getStepCompletion(data: ApplicationData): boolean[] {
  return [
    isBusinessInfoComplete(data),
    isAddressContactComplete(data),
    isOwnersComplete(data),
    isSignatoriesComplete(data),
    isBankingComplete(data),
    isSourceOfFundsComplete(data),
    isReviewComplete(data),
    isReviewComplete(data),
  ];
}

export function calculateCompletion(data: ApplicationData): {
  currentStep: number;
  completionPercentage: number;
} {
  const steps = getStepCompletion(data);
  const completedCount = steps.filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / TOTAL_STEPS) * 100);

  const firstIncompleteIndex = steps.findIndex((complete) => !complete);
  const currentStep = firstIncompleteIndex === -1 ? TOTAL_STEPS : firstIncompleteIndex + 1;

  return { currentStep, completionPercentage };
}
