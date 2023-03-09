import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import Random from 'src/common/Random';
import API, { GetUsersUserInfo } from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import {
  getRoleForStudy,
  isGlobalRoleType,
  rolesListFromApi,
  roleToApi,
  RoleType,
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

const random = new Random(2);
const membersListMock: GetUsersUserInfo[] = [
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
  id: String(idx),
  email,
  roles: (() => {
    if (random.num() > 0.9) return ['team-admin' as RoleType];
    const role = random.num() > 0.7 ? 'project-owner' : 'researcher';
    return ['1', '2'].map((projectId) =>
      roleToApi({
        role,
        projectId,
      })
    );
  })(),
}));

API.mock.provideEndpoints({
  getUsers() {
    return API.mock.response(membersListMock);
  },
  inviteUser(req) {
    const [{ email, roles }] = req;
    membersListMock.push({
      id: String(random.int()),
      email,
      roles,
    });

    return API.mock.response(undefined);
  },
  removeUser() {
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
    m.roles = m.roles.filter((mm) => req.roles.includes(mm));
    return API.mock.response(undefined);
  },
});

export type StudyMember = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'invited';
  role: RoleType;
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
        .map((u) => ({
          ...u,
          name: u.profile?.name,
          status: u.profile?.status === 'active' ? 'active' : 'invited',
          role: getRoleForStudy(rolesListFromApi(u.roles), params.studyId)?.role,
          apiData: u,
        }))
        .filter((u) => !!u.role) as StudyMember[],
    };
  },
});

export const useStudySettingsMembersList = membersListSlice.hook;

type MembersEditData = {
  id?: string;
  role?: RoleType;
  email: string;
  name: string;
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
      dispatch(membersEdit.actions.open({ email: '', name: '' }));
    }
  };

export const closeInviteEditMember = membersEdit.actions.close;

export const editStudyMember =
  (m: MembersEditData): AppThunk =>
  (dispatch) => {
    console.info(`Update study member ${JSON.stringify(m)}`);
    // TODO: update roles?
    dispatch(closeInviteEditMember());
    // TODO: refetch list
  };

export const inviteStudyMember =
  ({ email, role }: Required<Pick<MembersEditData, 'email' | 'role'>>): AppThunk =>
  async (dispatch, getState) => {
    dispatch(membersEdit.actions.createOrUpdateMemberInit());
    try {
      const studyId = selectedStudyIdSelector(getState());
      if (!studyId) {
        console.warn('Cannot invite member without study selected');
        return;
      }

      const res = await API.inviteUser([
        {
          email,
          roles: [roleToApi(isGlobalRoleType(role) ? { role } : { role, projectId: studyId })],
        },
      ]);
      res.checkError();
      dispatch(membersEdit.actions.createOrUpdateMemberSuccess());

      dispatch(showSnackbar({ text: 'Member has been successfully invited.' }));
      dispatch(membersListSlice.actions.refetch());
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.createOrUpdateMemberFailure({ error: String(err) }));
    }
  };

export const removeStudyMember =
  (m: Required<Pick<MembersEditData, 'id'>>): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(membersEdit.actions.deleteMemberInit());
      await API.removeUser({ accountId: m.id });
      dispatch(membersEdit.actions.deleteMemberSuccess());
      dispatch(closeInviteEditMember());
      dispatch(showSnackbar({ text: 'Member has been removed from the study.' }));
      dispatch(membersListSlice.actions.refetch()); // no waiting required
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      dispatch(membersEdit.actions.deleteMemberFailure({ error: String(e) }));
    }
  };

export default {
  [membersListSlice.name]: membersListSlice.reducer,
  [membersEdit.name]: membersEdit.reducer,
};
