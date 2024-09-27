import {GetUserResponse} from "src/modules/api";
import {User} from "src/modules/auth/auth.slice";
import {userRolesListFromApi} from "src/modules/auth/userRole";

export const transformUserFromApi = (res: GetUserResponse): User => ({
    ...res,
    roles: userRolesListFromApi(res.roles ?? [])
  })
