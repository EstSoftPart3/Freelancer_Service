import { faker } from '@faker-js/faker'

faker.seed(67890)

export const users = Array.from({ length: 500 }, () => {
  return {
    userTypeCd: faker.helpers.arrayElement([301, 302]),
    userId: faker.string.uuid(),
    profileImageSq: faker.number.int({ min: 1, max: 100 }),
    userNm: faker.person.fullName(),
    userEmail: faker.internet.email().toLocaleLowerCase(),
    userPhoneNum: faker.phone.number({ style: 'international' }),
    userBirthDt: faker.date.birthdate(),
    userPw: faker.internet.password(),
    userGenderCd: faker.helpers.arrayElement([101, 102]),
    userCreatedDtm: faker.date.past(),
    userModifiedDtm: faker.date.recent(),
    userIsDeletedYn: faker.helpers.arrayElement(['Y', 'N']),
    userIsActivateYn: faker.helpers.arrayElement(['Y', 'N']),
    userAgreedPrivacyPolicyYn: faker.helpers.arrayElement(['Y', 'N']),
    companySq: faker.number.int({ min: 1, max: 100 }),
  }
})
