import { z } from 'zod';

const businessTypeSchema = z.enum(['LIMITED_COMPANY', 'SOLE_TRADER', 'PARTNERSHIP']);
const monthlyVolumeSchema = z.enum(['UNDER_10K', '10K_TO_50K', '50K_TO_250K', 'ABOVE_250K']);
const statusSchema = z.enum(['DRAFT', 'SUBMITTED']);

const addressSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const contactSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

const ownerSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  country: z.string().min(1),
  email: z.string().email(),
  ownershipPercentage: z.number().int().gt(0).lte(100),
});

const signatorySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
});

const partialAddressSchema = addressSchema.partial().extend({
  addressLine1: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  addressLine2: z.string().nullable().optional(),
});

const partialContactSchema = contactSchema.partial().extend({
  email: z.string().email().optional(),
});

const partialOwnerSchema = ownerSchema.partial().extend({
  email: z.string().email().optional(),
  ownershipPercentage: z.number().int().gt(0).lte(100).optional(),
});

const partialSignatorySchema = signatorySchema.partial().extend({
  email: z.string().email().optional(),
});

export const listApplicationsQuerySchema = z.object({
  search: z.string().optional(),
  status: statusSchema.optional(),
});

export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;

export const createApplicationBodySchema = z
  .object({
    data: z.record(z.unknown()).optional(),
  })
  .optional()
  .default({});

export const applicationDraftPatchSchema = z.object({
  data: z
    .object({
      businessType: businessTypeSchema.nullable().optional(),
      legalName: z.string().nullable().optional(),
      registrationNumber: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      incorporationDate: z.string().nullable().optional(),
      industry: z.string().nullable().optional(),
      website: z.string().nullable().optional(),
      monthlyTransactionVolume: monthlyVolumeSchema.nullable().optional(),
      sourceOfFunds: z.string().nullable().optional(),
      registeredAddress: partialAddressSchema.nullable().optional(),
      operatingAddressDifferent: z.boolean().nullable().optional(),
      operatingAddress: partialAddressSchema.nullable().optional(),
      primaryContact: partialContactSchema.nullable().optional(),
      owners: z.array(partialOwnerSchema).optional(),
      signatories: z.array(partialSignatorySchema).optional(),
      accountPurposes: z.array(z.string()).optional(),
      transferCountries: z.array(z.string()).optional(),
      expectedInternationalTransferVolume: z.string().nullable().optional(),
      additionalInformation: z.string().nullable().optional(),
      confirmationAccepted: z.boolean().nullable().optional(),
    })
    .optional(),
});

export type ApplicationDraftPatch = z.infer<typeof applicationDraftPatchSchema>;

export {
  addressSchema,
  contactSchema,
  ownerSchema,
  signatorySchema,
  businessTypeSchema,
  monthlyVolumeSchema,
};
