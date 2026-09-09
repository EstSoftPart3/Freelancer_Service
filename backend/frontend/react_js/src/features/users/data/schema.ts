import { z } from 'zod'

export const adminUserSchema = z.object({
  userTypeCd: z.number(),
  userId: z.string(),
  profileImageUrl: z.string().nullable(),
  profileImageSq: z.number().nullable().optional(),
  userNm: z.string(),
  userEmail: z.string(),
  userPhoneNum: z.string(),
  userBirthDt: z.coerce.date().optional(),
  userGenderCd: z.number(),
  userCreatedDtm: z.coerce.date(),
  userModifiedDtm: z.coerce.date(),
  userIsDeletedYn: z.string(),
  userSq: z.number(),
  userSignupTypeCd: z.number(),
  userIsActivateYn: z.string(),
  userAgreedPrivacyPolicyYn: z.string(),
  companyNm: z.string().nullable(),
  companySq: z.number().nullable().optional(),
})

export type AdminUser = z.infer<typeof adminUserSchema>

export const userListSchema = z.array(adminUserSchema)
