import API, { GetUsersResponse } from "src/modules/api";
import { transformUserInfoFromApi } from "src/modules/study-settings/studySettings.mapper";
import { AppDispatch, makeStore } from "src/modules/store/store";
import { createTestStore } from "src/modules/store/testing";
import { useAppDispatch } from "src/modules/store";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";
import { mockProjectId, mockUserInfoList } from "src/modules/study-settings/studySettings.slice.mock";
import { HTTP_CODE_CONFLICT } from "src/modules/api/code";
import {
  closeInviteEditMember,
  openInviteEditMember,
  inviteStudyMember,
  editStudyMember,
  removeStudyMember,
} from './studySettings.slice';
import { Response } from '../api/executeRequest';

const userInfoList = mockUserInfoList.slice(0, 2)
const studyMembersList = userInfoList.map((u) => transformUserInfoFromApi(u, mockProjectId))

const listStateKey = 'studySettings/membersList'
const editStateKey = 'studySettings/membersEdit'

let store: ReturnType<typeof makeStore>
let dispatch: AppDispatch

const mockInviteUser = () => {
  API.mock.provideEndpoints({
    getUsers() {
      return API.mock.response(mockUserInfoList);
    },
    inviteUser() {
      return API.mock.response(undefined);
    }
  })
}

const mockInviteUserConflictError = () => {
  API.mock.provideEndpoints({
    inviteUser() {
      return API.mock.response(undefined);
    }
  })
}

const mockRemoveUserRole = () => {
  API.mock.provideEndpoints({
    getUsers() {
      return API.mock.response(mockUserInfoList);
    },
    removeUserRole(){
      return API.mock.response(undefined);
    }
  });
}

const mockRemoveUserRoleError = () => {
   API.mock.provideEndpoints({
    removeUserRole(){
      return API.mock.failedResponse({status: 400, message: 'error'});
    }
  });
}

const mockEditUser = () => {
  API.mock.provideEndpoints({
    updateUserRole(){
      return API.mock.response(undefined);
    }
  });
}

beforeAll(() => {
  store = createTestStore({
    studies: {
      isLoading: false,
      studies: [
        {
          id: mockProjectId,
          name: mockProjectId,
          color: 'primary',
          createdAt: 1652648400000,
        },
      ],
      selectedStudyId: mockProjectId,
    },
    [listStateKey]: {
      isLoading: false,
      fetchArgs: { studyId: mockProjectId },
      prevFetchArgs: null,
      data: studyMembersList,
    },
  })

  const {
    result: { current },
  } = renderHook(() => useAppDispatch(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  dispatch = current
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('study members', () => {
  it('should retrieve study members', () => {
    const getState = () => store.getState()[listStateKey]
    expect(getState().data?.sort()).toEqual(studyMembersList.sort())
  })


  it('should retrieve initialized edit states', () => {
    const getState = () => store.getState()[editStateKey]
    expect(getState().isOpen).toBeFalse()
    expect(getState().isSending).toBeFalse()
    expect(getState().isDeleting).toBeFalse()
    expect(getState().error).toBeUndefined()
  })

  it('should control edit states', async () => {
    const getState = () => store.getState()[editStateKey]
    expect(getState().isOpen).toBeFalse()
    await dispatch(openInviteEditMember({ id: studyMembersList[0].id }))
    expect(getState().isOpen).toBeTrue()
    await dispatch(closeInviteEditMember())
    expect(getState().isOpen).toBeFalse()
  })

  it('[NEGATIVE] should control edit states with wrong member id', async () => {
    const getState = () => store.getState()[editStateKey]
    expect(getState().isOpen).toBeFalse()
    await dispatch(openInviteEditMember({ id: "test" }))
    expect(getState().isOpen).toBeFalse()
  })

  it('should invite study member', async () => {
    mockInviteUser()
    const getMemberEditState = () => store.getState()[editStateKey]
    const getMemberListState = () => store.getState()[listStateKey]

    const user = mockUserInfoList[mockUserInfoList.length - 1]
    expect(getMemberListState().data?.find(m => m.id === user.id)).toBeFalsy()
    await dispatch(inviteStudyMember({ email: user.email, role: 'studyResearcher' }))
    
    expect(getMemberEditState().isSending).toBeFalse()
    expect(getMemberEditState().error).toBeUndefined()
    expect(getMemberListState().data?.find(m => m.id === user.id)).toBeTruthy()
    expect(getMemberListState().error).toBeUndefined()
  })

  it('should remove study member', async () => {
    mockRemoveUserRole()
    const getMemberEditState = () => store.getState()[editStateKey]
    const getMemberListState = () => store.getState()[listStateKey]
    const user = mockUserInfoList[mockUserInfoList.length - 1]
    await dispatch(removeStudyMember(user))
    expect(getMemberEditState().isDeleting).toBeFalse()
    expect(getMemberEditState().error).toBeUndefined()
    expect(getMemberListState().error).toBeUndefined()
  })

  it('[NEGATIVE] should invite study member with same role', async () => {
    mockInviteUserConflictError()
    const getMemberEditState = () => store.getState()[editStateKey]
    const getMemberListState = () => store.getState()[listStateKey]

    const user = userInfoList[0]
    await dispatch(inviteStudyMember({ email: user.email, role: 'studyAdmin' }))
    expect(getMemberEditState().isSending).toBeFalse()
    expect(getMemberListState().error).toBeUndefined()
  })

  it('[NEGATIVE] remove non-existent study member', async () => {
    mockRemoveUserRoleError()
    const getMemberEditState = () => store.getState()[editStateKey]
    const getMemberListState = () => store.getState()[listStateKey]
    const user = mockUserInfoList[mockUserInfoList.length - 1]
    await dispatch(removeStudyMember(user))
    expect(getMemberEditState().isDeleting).toBeFalse()
    expect(getMemberEditState().error).toBeTruthy()
    expect(getMemberListState().error).toBeUndefined()
  })

  it('should edit study member', async () => {
    mockEditUser()
    const getMemberEditState = () => store.getState()[editStateKey]

    const user = studyMembersList[0]
    await dispatch(editStudyMember({ id: user.id, email: user.email, role: 'studyAdmin' }))
    expect(getMemberEditState().error).toBeUndefined()
  })
})
