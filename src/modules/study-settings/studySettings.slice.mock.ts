import { GetUserResponse } from "src/modules/api";

export const mockProjectId = "testStudy";

export const mockUserInfoList: GetUserResponse[] = [
  {
    id: "admin",
    firstName: "firstName",
    lastName: "lastName",
    company: "company",
    team: "team",
    email: "admin@email.com",
    officePhoneNumber: "000",
    mobilePhoneNumber: "000",
    roles: ['studyAdmin'],
  },
  {
    id: "manager",
    firstName: "firstName",
    lastName: "lastName",
    company: "company",
    team: "team",
    email: "manager@email.com",
    officePhoneNumber: "000",
    mobilePhoneNumber: "000",
    roles: ['studyManager'],
  },
  {
    id: "researcher",
    firstName: "firstName",
    lastName: "lastName",
    company: "company",
    team: "team",
    email: "researcher@email.com",
    officePhoneNumber: "000",
    mobilePhoneNumber: "000",
    roles: ['studyResearcher'],
  }
]
