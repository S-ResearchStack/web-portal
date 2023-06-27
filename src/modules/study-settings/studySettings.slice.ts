import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _cloneDeep from 'lodash/cloneDeep';

import Random from 'src/common/Random';
import API, { GetUsersUserInfo } from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import {
  getRolesForStudy,
  isStudyCreator,
  roleLabelsMap,
  userRolesListFromApi,
  roleToApi,
  RoleType,
  isGlobalRoleType,
} from 'src/modules/auth/userRole';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import {
  AppThunk,
  useAppSelector,
  WithData,
  WithDeleting,
  WithError,
  WithSending,
} from 'src/modules/store';
import createDataSlice from 'src/modules/store/createDataSlice';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';
// eslint-disable-next-line import/no-cycle
import { MOCK_ACCOUNT_ID } from './utils';

const random = new Random(2);
const membersListMock: GetUsersUserInfo[] = [
  'samuel.sung@samsung.com',
  'louise@example.com',
  'cecelia@example.com',
  'kendra@example.com',
  'lester@example.com',
  'nicolas@example.com',
  'adnan@example.com',
  'braxton@example.com',
  'mindy@example.com',
  'will@example.com',
  'stephan@example.com',
  'celeste@example.com',
  'dianne@example.com',
  'bree@example.com',
  'simeon@example.com',
  'jerry@example.com',
].map((email, idx) => ({
  id: idx === 0 ? MOCK_ACCOUNT_ID : String(random.num()),
  profile: {
    name: email.split('@')[0],
    status: random.num() > 0.1 ? 'active' : 'invited',
  },
  email,
  mgmtAccess: idx % 3 === 0 || email === 'samuelsung@samsung.com',
  roles: (() => {
    let role: RoleType[] = [];

    if (random.num() > 0.8) {
      role = ['research-assistant'];
    } else if (random.num() > 0.6) {
      role = ['data-scientist'];
    } else if (random.num() > 0) {
      role = ['research-assistant', 'data-scientist'];
    }

    if (idx % 3 === 0) {
      role.push('principal-investigator');
    }

    if (idx % 4 === 0) {
      role = [role[0]];
    }

    if (email === 'samuel.sung@samsung.com') {
      role = ['principal-investigator', 'team-admin', 'study-creator'];
    }

    return ['1', '2']
      .map((projectId) =>
        roleToApi({
          roles: [...role],
          projectId,
        })
      )
      .flat();
  })(),
}));

API.mock.provideEndpoints({
  getUsers() {
    // clone deep is required here otherwise whole mock list data gets writable=false for some reason
    return API.mock.response(_cloneDeep(membersListMock));
  },
  inviteUsers(req) {
    const { email, roles, mgmtAccess } = req[0];

    membersListMock.push({
      id: MOCK_ACCOUNT_ID,
      email,
      roles,
      mgmtAccess,
      profile: {
        name: email.split('@')[0],
        status: 'invited',
      },
    });

    return API.mock.response(undefined);
  },
  updateUserRole(req) {
    const m = membersListMock.find((mm) => mm.id === req.accountId);
    if (!m) {
      return API.mock.failedResponse({ status: 404 });
    }
    m.roles = [...m.roles, ...req.roles];
    return API.mock.response(undefined);
  },
  removeUserRole(req) {
    const m = membersListMock.find((mm) => mm.id === req.accountId);
    if (!m) {
      return API.mock.failedResponse({ status: 404 });
    }
    m.roles = m.roles.filter((mm) => !req.roles.includes(mm));
    return API.mock.response(undefined);
  },
});

export type StudyMember = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'invited';
  mgmtAccess?: boolean; // TODO add when api will be ready
  roles?: RoleType[];
};

type GetMembersListParams = {
  studyId: string;
};

const membersListSlice = createDataSlice({
  name: 'studySettings/membersList',
  fetchData: async (params: GetMembersListParams) => {
    const { data } = await API.getUsers({ projectId: params.studyId });

    return {
      users: data
        .map((u) => {
          const roles = getRolesForStudy(userRolesListFromApi(u.roles), params.studyId)?.roles;
          const name = isStudyCreator(roles)
            ? `${u.profile?.name} (${roleLabelsMap['study-creator']})`
            : u.profile?.name;
          return {
            ...u,
            name,
            status: u.profile?.status === 'active' ? 'active' : 'invited',
            apiData: u,
            roles,
            mgmtAccess: false, // u.mgmtAccess, TODO: unsupported by API
          };
        })
        .filter((u) => !!u.roles) as StudyMember[],
    };
  },
});

export const useStudySettingsMembersList = membersListSlice.hook;

type MembersEditData = {
  id?: string;
  roles?: RoleType[];
  email: string;
  name: string;
  mgmtAccess?: boolean;
};

type MembersEditState = {
  isOpen: boolean;
} & WithSending &
  WithDeleting &
  WithData<MembersEditData>;

const membersEditInitialState: MembersEditState = {
  isOpen: false,
  isSending: false,
  isDeleting: false,
  error: undefined,
};

const membersEdit = createSlice({
  name: 'studySettings/membersEdit',
  initialState: membersEditInitialState,
  reducers: {
    createOrUpdateMemberInit(state) {
      state.isSending = true;
    },
    createOrUpdateMemberSuccess(state) {
      state.isSending = false;
      state.error = undefined;
    },
    createOrUpdateMemberFailure(state, action: PayloadAction<Required<WithError>>) {
      state.isSending = false;
      state.error = action.payload.error;
    },
    deleteMemberInit(state) {
      state.isDeleting = true;
    },
    deleteMemberSuccess(state) {
      state.isDeleting = false;
      state.error = undefined;
    },
    deleteMemberFailure(state, action: PayloadAction<Required<WithError>>) {
      state.isDeleting = false;
      state.error = action.payload.error;
    },
    open(state, action: PayloadAction<MembersEditData>) {
      state.isOpen = true;
      state.data = action.payload;
    },
    close(state) {
      Object.assign(state, membersEditInitialState);
    },
  },
});

export const useInviteEditMember = () =>
  useAppSelector((state) => state['studySettings/membersEdit']);

export const openInviteEditMember =
  ({ id }: { id?: string }): AppThunk =>
  (dispatch, getState) => {
    if (id) {
      const members = membersListSlice.stateSelector(getState());
      const editMember = members.data?.users.find((u) => u.id === id);
      if (editMember) {
        dispatch(membersEdit.actions.open(editMember));
      } else {
        console.warn(`Failed to find member with id ${id} to edit`);
      }
    } else {
      dispatch(membersEdit.actions.open({ email: '', name: '', roles: [] }));
    }
  };

export const closeInviteEditMember = membersEdit.actions.close;

export const editStudyMember =
  (m: MembersEditData): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(membersEdit.actions.createOrUpdateMemberInit());
      const user = getState()['studySettings/membersList'].data?.users?.find((u) => u.id === m.id);
      if (!user || !m.id) {
        console.error(`Failed to remove user ${m.id}, user not found`);
        return;
      }
      const studyId = selectedStudyIdSelector(getState());

      const currentProjectRoles = user.roles || [];
      const newRoles = m.roles || [];
      const rolesToAdd = newRoles
        .filter((r) => !currentProjectRoles.includes(r))
        .filter((r) => !isGlobalRoleType(r));
      const rolesToRemove = currentProjectRoles
        .filter((r) => !newRoles.includes(r))
        .filter((r) => !isGlobalRoleType(r));

      if (rolesToAdd.length) {
        const res = await API.updateUserRole({
          accountId: m.id,
          roles: roleToApi({ roles: rolesToAdd, projectId: studyId }),
        });
        res.checkError();
      }
      if (rolesToRemove.length) {
        const res = await API.removeUserRole({
          accountId: m.id,
          roles: roleToApi({ roles: rolesToRemove, projectId: studyId }),
        });
        res.checkError();
      }
      dispatch(closeInviteEditMember());
      dispatch(membersListSlice.actions.refetch()); // no waiting required
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.createOrUpdateMemberFailure({ error: String(err) }));
    }
  };

export const inviteStudyMember =
  ({
    email,
    roles,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mgmtAccess,
  }: Required<Pick<MembersEditData, 'email' | 'mgmtAccess' | 'roles'>>): AppThunk =>
  async (dispatch, getState) => {
    dispatch(membersEdit.actions.createOrUpdateMemberInit());
    try {
      const studyId = selectedStudyIdSelector(getState());
      if (!studyId) {
        console.warn('Cannot invite member without study selected');
        return;
      }

      const res = await API.inviteUsers([
        {
          email,
          roles: roleToApi({ roles, projectId: studyId }),
          // TODO: use actual value when API support is added
          mgmtAccess: undefined as unknown as boolean,
        },
      ]);
      res.checkError();
      dispatch(membersEdit.actions.createOrUpdateMemberSuccess());

      dispatch(showSnackbar({ text: 'Email invitation successfully sent.' }));
      dispatch(membersListSlice.actions.refetch());
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.createOrUpdateMemberFailure({ error: String(err) }));
    }
  };

export const removeStudyMember =
  (m: Required<Pick<MembersEditData, 'id'>>): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(membersEdit.actions.deleteMemberInit());
      const user = getState()['studySettings/membersList'].data?.users?.find((u) => u.id === m.id);
      if (!user) {
        console.error(`Failed to remove user ${m.id}, user not found`);
        return;
      }
      const rolesToRemove = roleToApi({
        projectId: selectedStudyIdSelector(getState()),
        roles: user.roles?.filter((r) => !isGlobalRoleType(r)) || [],
      });
      const res = await API.removeUserRole({
        accountId: m.id,
        roles: rolesToRemove,
      });
      res.checkError();
      dispatch(membersEdit.actions.deleteMemberSuccess());
      dispatch(closeInviteEditMember());
      dispatch(showSnackbar({ text: 'Member has been removed from the study.' }));
      dispatch(membersListSlice.actions.refetch()); // no waiting required
    } catch (err) {
      console.error(err);
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.deleteMemberFailure({ error: String(err) }));
    }
  };

export default {
  [membersListSlice.name]: membersListSlice.reducer,
  [membersEdit.name]: membersEdit.reducer,
};
