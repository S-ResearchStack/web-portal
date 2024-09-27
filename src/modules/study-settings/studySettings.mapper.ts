import {GetUserResponse} from "src/modules/api";
import {StudyMember} from "src/modules/study-settings/studySettings.slice";
import {RoleType} from "src/modules/auth/userRole";

export const transformUserInfoFromApi = (res: GetUserResponse, studyId: string): StudyMember => {
  const roles = res.roles as RoleType[];
  return {
    id: res.id,
    email: res.email,
    name: `${res.lastName} ${res.firstName}`, // TODO: last name first?
    status: 'active',
    company: res.company,
    team: res.team,
    officePhoneNumber: res.officePhoneNumber,
    mobilePhoneNumber: res.mobilePhoneNumber,
    roles,
    mgmtAccess: false
  }
}
