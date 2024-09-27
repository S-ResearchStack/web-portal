import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import API from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { RoleType } from 'src/modules/auth/userRole';
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
import { HTTP_CODE_CONFLICT } from "src/modules/api/code";
import { ALREADY_INVITED_USER, INVITATION_SUCCESS } from "src/modules/study-settings/StudySettings.message";
import { transformUserInfoFromApi } from "src/modules/study-settings/studySettings.mapper";
import { mockUserInfoList } from './studySettings.slice.mock';

API.mock.provideEndpoints({
  getUsers() {
    return API.mock.response(mockUserInfoList);
  },
});

export type StudyMember = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'invited';
  company: string;
  team: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;
  mgmtAccess?: boolean; // TODO add when api will be ready
  roles?: RoleType[];
};

type GetMembersListParams = {
  studyId: string;
};

const membersListSlice = createDataSlice({
  name: 'studySettings/membersList',
  fetchData: async (params: GetMembersListParams) => {
    const { data } = await API.getUsers({ studyId: params.studyId });
    return data.map((u) => transformUserInfoFromApi(u, params.studyId));
  },
});

export const useStudySettingsMembersList = membersListSlice.hook;

type MembersEditData = {
  id?: string;
  email: string;
  role?: RoleType;
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

export const openInviteEditMember =
  ({ id }: { id?: string }): AppThunk =>
  (dispatch, getState) => {
    if (id) {
      const members = membersListSlice.stateSelector(getState());
      const editMember = members.data?.find((u) => u.id === id);
      if (editMember) {
        dispatch(membersEdit.actions.open({
          id: editMember.id,
          email: editMember.email,
          role: editMember.roles ? editMember.roles[0] : undefined
        }));
      } else {
        console.warn(`Failed to find member with id ${id} to edit`);
      }
    } else {
      dispatch(membersEdit.actions.open({ email: '' }));
    }
  };

export const closeInviteEditMember = membersEdit.actions.close;

export const editStudyMember =
  (m: MembersEditData): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(membersEdit.actions.createOrUpdateMemberInit());
      const user = getState()['studySettings/membersList'].data?.find((u) => u.id === m.id);
      if (!user || !m.id) {
        console.error(`Failed to update user role, user not found`);
        return;
      }
      const studyId = selectedStudyIdSelector(getState());
      if(!studyId) {
        console.error(`Failed to update user role, study not found`);
        return;
      }

      if(!m.role) {
        console.error(`Failed to update user role, role is not defined`);
        return
      }

      const { checkError } = await API.updateUserRole(m.id, { studyId, role: m.role})
      checkError()

      dispatch(closeInviteEditMember());
      await dispatch(membersListSlice.actions.refetch()); // no waiting required
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.createOrUpdateMemberFailure({ error: String(err) }));
    }
  };

export const inviteStudyMember =
  ({
    email,
    role,
  }: Required<Pick<MembersEditData, 'email' | 'role'>>): AppThunk =>
  async (dispatch, getState) => {
    dispatch(membersEdit.actions.createOrUpdateMemberInit());
    try {
      const studyId = selectedStudyIdSelector(getState());
      if (!studyId) {
        console.warn('Cannot invite member without study selected');
        return;
      }

      const res = await API.inviteUser({
        email,
        studyId,
        role
      })

      if(res.status === HTTP_CODE_CONFLICT) {
        dispatch(membersEdit.actions.createOrUpdateMemberFailure({error: ALREADY_INVITED_USER}));
        dispatch(showSnackbar({ text: ALREADY_INVITED_USER }));
      } else {
        res.checkError()
        dispatch(membersEdit.actions.createOrUpdateMemberSuccess());

        dispatch(showSnackbar({ text: INVITATION_SUCCESS }));
        await dispatch(membersListSlice.actions.refetch());
      }
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.createOrUpdateMemberFailure({ error: String(err) }));
    }
  };

export const removeStudyMember =
  (m: Required<Pick<MembersEditData, 'id'>>): AppThunk =>
  async (dispatch, getState) => {
    const studyId = selectedStudyIdSelector(getState())
    if(!studyId) {
      console.error(`Failed to remove user ${m.id}, study not found`);
      return;
    }
    const user = getState()['studySettings/membersList'].data?.find((u) => u.id === m.id);
    if (!user) {
      console.error(`Failed to remove user ${m.id}, user not found`);
      return;
    }

    try {
      dispatch(membersEdit.actions.deleteMemberInit());
      const res = await API.removeUserRole(user.id, { studyId });
      res.checkError();
      dispatch(membersEdit.actions.deleteMemberSuccess());
      dispatch(closeInviteEditMember());
      dispatch(showSnackbar({ text: 'Member has been removed from the study.' }));
      await dispatch(membersListSlice.actions.refetch()); // no waiting required
    } catch (err) {
      console.error(err);
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(membersEdit.actions.deleteMemberFailure({ error: String(err) }));
    }
  };

export const useInviteEditMember = () =>
  useAppSelector((state) => state['studySettings/membersEdit']);

export default {
  [membersListSlice.name]: membersListSlice.reducer,
  [membersEdit.name]: membersEdit.reducer,
};
