import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app-error';
import {
  ApplicationDraftPatch,
  ListApplicationsQuery,
} from './application.schemas';
import {
  Application,
  ApplicationData,
  ApplicationSummary,
  Address,
  Contact,
  emptyApplicationData,
} from './application.types';
import { ApplicationsRepository } from './applications.repository';
import { calculateCompletion } from './completion';

@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(ApplicationsRepository)
    private readonly repository: ApplicationsRepository,
  ) {}

  list(query: ListApplicationsQuery): { items: ApplicationSummary[] } {
    const applications = this.repository.findAll({
      search: query.search,
      status: query.status,
    });

    return {
      items: applications.map((application) => this.toSummary(application)),
    };
  }

  getById(id: string): Application {
    const application = this.repository.findById(id);
    if (!application) {
      throw AppError.notFound(`Application ${id} was not found.`);
    }
    return application;
  }

  create(): Application {
    const now = new Date().toISOString();
    const data = emptyApplicationData();
    const { currentStep, completionPercentage } = calculateCompletion(data);

    return this.repository.create({
      status: 'DRAFT',
      currentStep,
      completionPercentage,
      createdAt: now,
      lastUpdatedAt: now,
      data,
    });
  }

  update(id: string, patch: ApplicationDraftPatch): Application {
    const existing = this.getById(id);
    if (existing.status === 'SUBMITTED') {
      throw AppError.conflict('Submitted applications cannot be modified.');
    }

    const mergedData = this.mergeData(existing.data, patch.data);
    const { currentStep, completionPercentage } = calculateCompletion(mergedData);
    const updated: Application = {
      ...existing,
      data: mergedData,
      currentStep,
      completionPercentage,
      lastUpdatedAt: new Date().toISOString(),
    };

    const saved = this.repository.update(id, updated);
    if (!saved) {
      throw AppError.notFound(`Application ${id} was not found.`);
    }
    return saved;
  }

  submit(id: string): Application {
    const existing = this.getById(id);
    if (existing.status === 'SUBMITTED') {
      throw AppError.conflict('Application has already been submitted.');
    }

    this.assertSubmittable(existing.data);

    const { currentStep, completionPercentage } = calculateCompletion(existing.data);
    const updated: Application = {
      ...existing,
      status: 'SUBMITTED',
      currentStep,
      completionPercentage,
      lastUpdatedAt: new Date().toISOString(),
    };

    const saved = this.repository.update(id, updated);
    if (!saved) {
      throw AppError.notFound(`Application ${id} was not found.`);
    }
    return saved;
  }

  private toSummary(application: Application): ApplicationSummary {
    return {
      id: application.id,
      status: application.status,
      businessName: application.data.legalName,
      country: application.data.country,
      currentStep: application.currentStep,
      completionPercentage: application.completionPercentage,
      lastUpdatedAt: application.lastUpdatedAt,
    };
  }

  private mergeData(
    current: ApplicationData,
    patch: ApplicationDraftPatch['data'],
  ): ApplicationData {
    if (!patch) {
      return current;
    }

    const next: ApplicationData = { ...current };

    if (Object.prototype.hasOwnProperty.call(patch, 'businessType')) {
      next.businessType = patch.businessType ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'legalName')) {
      next.legalName = patch.legalName ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'registrationNumber')) {
      next.registrationNumber = patch.registrationNumber ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'country')) {
      next.country = patch.country ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'incorporationDate')) {
      next.incorporationDate = patch.incorporationDate ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'industry')) {
      next.industry = patch.industry ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'website')) {
      next.website = patch.website ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'monthlyTransactionVolume')) {
      next.monthlyTransactionVolume = patch.monthlyTransactionVolume ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'sourceOfFunds')) {
      next.sourceOfFunds = patch.sourceOfFunds ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'operatingAddressDifferent')) {
      next.operatingAddressDifferent = patch.operatingAddressDifferent ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'expectedInternationalTransferVolume')) {
      next.expectedInternationalTransferVolume =
        patch.expectedInternationalTransferVolume ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'additionalInformation')) {
      next.additionalInformation = patch.additionalInformation ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'confirmationAccepted')) {
      next.confirmationAccepted = patch.confirmationAccepted ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'registeredAddress')) {
      next.registeredAddress = this.mergeNullableObject(
        current.registeredAddress,
        patch.registeredAddress,
      ) as Address | null;
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'operatingAddress')) {
      next.operatingAddress = this.mergeNullableObject(
        current.operatingAddress,
        patch.operatingAddress,
      ) as Address | null;
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'primaryContact')) {
      next.primaryContact = this.mergeNullableObject(
        current.primaryContact,
        patch.primaryContact,
      ) as Contact | null;
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'owners') && patch.owners !== undefined) {
      next.owners = patch.owners.map((owner) => ({
        fullName: owner.fullName ?? '',
        dateOfBirth: owner.dateOfBirth ?? '',
        country: owner.country ?? '',
        email: owner.email ?? '',
        ownershipPercentage: owner.ownershipPercentage ?? 0,
      }));
    }

    if (
      Object.prototype.hasOwnProperty.call(patch, 'signatories') &&
      patch.signatories !== undefined
    ) {
      next.signatories = patch.signatories.map((signatory) => ({
        fullName: signatory.fullName ?? '',
        email: signatory.email ?? '',
        role: signatory.role ?? '',
      }));
    }

    if (
      Object.prototype.hasOwnProperty.call(patch, 'accountPurposes') &&
      patch.accountPurposes !== undefined
    ) {
      next.accountPurposes = [...patch.accountPurposes];
    }

    if (
      Object.prototype.hasOwnProperty.call(patch, 'transferCountries') &&
      patch.transferCountries !== undefined
    ) {
      next.transferCountries = [...patch.transferCountries];
    }

    return next;
  }

  private mergeNullableObject<T extends object>(
    current: T | null,
    patch: Partial<T> | null | undefined,
  ): T | null {
    if (patch === null) {
      return null;
    }
    if (patch === undefined) {
      return current;
    }
    return { ...(current ?? ({} as T)), ...patch };
  }

  private assertSubmittable(data: ApplicationData): void {
    const fields: Record<string, string> = {};

    if (!data.businessType) {
      fields.businessType = 'Business type is required.';
    }
    if (!data.legalName?.trim()) {
      fields.legalName = 'Business name is required.';
    }
    if (!data.country?.trim()) {
      fields.country = 'Country is required.';
    }
    if (!data.incorporationDate?.trim()) {
      fields.incorporationDate = 'Incorporation date is required.';
    } else if (this.isFutureDate(data.incorporationDate)) {
      fields.incorporationDate = 'Incorporation date must not be in the future.';
    }
    if (!data.industry?.trim()) {
      fields.industry = 'Industry is required.';
    }
    if (!data.monthlyTransactionVolume) {
      fields.monthlyTransactionVolume = 'Monthly transaction volume is required.';
    }

    if (
      data.businessType &&
      data.businessType !== 'SOLE_TRADER' &&
      !data.registrationNumber?.trim()
    ) {
      fields.registrationNumber = 'Registration number is required for this business type.';
    }

    if (data.monthlyTransactionVolume === 'ABOVE_250K' && !data.sourceOfFunds?.trim()) {
      fields.sourceOfFunds = 'Source of funds is required for high transaction volume.';
    }

    if (!data.registeredAddress) {
      fields.registeredAddress = 'Registered address is required.';
    } else {
      this.requireAddressFields(data.registeredAddress, 'registeredAddress', fields);
    }

    if (data.operatingAddressDifferent === true) {
      if (!data.operatingAddress) {
        fields.operatingAddress = 'Operating address is required when it differs from registered address.';
      } else {
        this.requireAddressFields(data.operatingAddress, 'operatingAddress', fields);
      }
    }

    if (!data.primaryContact) {
      fields.primaryContact = 'Primary contact is required.';
    } else {
      if (!data.primaryContact.fullName?.trim()) {
        fields['primaryContact.fullName'] = 'Full name is required.';
      }
      if (!data.primaryContact.email?.trim()) {
        fields['primaryContact.email'] = 'Email is required.';
      }
      if (!data.primaryContact.phone?.trim()) {
        fields['primaryContact.phone'] = 'Phone is required.';
      }
    }

    if (data.owners.length < 1) {
      fields.owners = 'At least one beneficial owner is required.';
    } else {
      const emails = new Set<string>();
      let ownershipTotal = 0;

      data.owners.forEach((owner, index) => {
        const prefix = `owners.${index}`;
        if (!owner.fullName?.trim()) {
          fields[`${prefix}.fullName`] = 'Full name is required.';
        }
        if (!owner.dateOfBirth?.trim()) {
          fields[`${prefix}.dateOfBirth`] = 'Date of birth is required.';
        }
        if (!owner.country?.trim()) {
          fields[`${prefix}.country`] = 'Country is required.';
        }
        if (!owner.email?.trim()) {
          fields[`${prefix}.email`] = 'Email is required.';
        } else {
          const normalized = owner.email.trim().toLowerCase();
          if (emails.has(normalized)) {
            fields[`${prefix}.email`] = 'Duplicate owner email addresses are invalid.';
          }
          emails.add(normalized);
        }
        if (
          !Number.isInteger(owner.ownershipPercentage) ||
          owner.ownershipPercentage <= 0 ||
          owner.ownershipPercentage > 100
        ) {
          fields[`${prefix}.ownershipPercentage`] =
            'Ownership percentage must be an integer greater than 0 and at most 100.';
        } else {
          ownershipTotal += owner.ownershipPercentage;
        }
      });

      if (data.owners.length > 0 && ownershipTotal !== 100) {
        fields.owners = 'Total ownership must equal exactly 100%.';
      }
    }

    if (data.signatories.length < 1) {
      fields.signatories = 'At least one authorized signatory is required.';
    } else {
      const emails = new Set<string>();
      data.signatories.forEach((signatory, index) => {
        const prefix = `signatories.${index}`;
        if (!signatory.fullName?.trim()) {
          fields[`${prefix}.fullName`] = 'Full name is required.';
        }
        if (!signatory.email?.trim()) {
          fields[`${prefix}.email`] = 'Email is required.';
        } else {
          const normalized = signatory.email.trim().toLowerCase();
          if (emails.has(normalized)) {
            fields[`${prefix}.email`] = 'Duplicate signatory email addresses are invalid.';
          }
          emails.add(normalized);
        }
        if (!signatory.role?.trim()) {
          fields[`${prefix}.role`] = 'Role is required.';
        }
      });
    }

    if (data.accountPurposes.length < 1) {
      fields.accountPurposes = 'At least one account purpose is required.';
    }

    if (
      data.accountPurposes.includes('INTERNATIONAL_TRANSFERS') &&
      !data.expectedInternationalTransferVolume?.trim()
    ) {
      fields.expectedInternationalTransferVolume =
        'International transfer volume is required when international transfers are selected.';
    }

    if (data.confirmationAccepted !== true) {
      fields.confirmationAccepted = 'Confirmation must be accepted before submission.';
    }

    if (Object.keys(fields).length > 0) {
      throw AppError.validation('Some fields are invalid.', fields);
    }
  }

  private requireAddressFields(
    address: Address,
    prefix: string,
    fields: Record<string, string>,
  ): void {
    if (!address.addressLine1?.trim()) {
      fields[`${prefix}.addressLine1`] = 'Address line 1 is required.';
    }
    if (!address.city?.trim()) {
      fields[`${prefix}.city`] = 'City is required.';
    }
    if (!address.postalCode?.trim()) {
      fields[`${prefix}.postalCode`] = 'Postal code is required.';
    }
    if (!address.country?.trim()) {
      fields[`${prefix}.country`] = 'Country is required.';
    }
  }

  private isFutureDate(isoDate: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!match) {
      return false;
    }
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const valueUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return valueUtc > todayUtc;
  }
}
