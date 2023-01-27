import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAppDispatch } from '../store';
import { createTestStore } from '../store/testing';
import {
  closeInviteEditMember,
  inviteStudyMember,
  openInviteEditMember,
  removeStudyMember,
} from './studySettings.slice';

describe('studySettings slice', () => {
  it('should handle actions', async () => {
    const store = createTestStore({
      studies: {
        isLoading: false,
        studies: [{ id: 'test', name: 'test', color: 'primary' }],
        selectedStudyId: 'test',
      },
      'studySettings/membersList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          users: [
            {
              id: 'test',
              email: 'test',
              name: 'test',
              status: 'active',
              role: 'team-admin',
            },
          ],
        },
      },
    });

    const {
      result: { current: dispatch },
    } = renderHook(() => useAppDispatch(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const getState = () => store.getState()['studySettings/membersEdit'];

    expect(getState().isOpen).toBeFalse();
    dispatch(openInviteEditMember({ id: 'test' }));
    expect(getState().isOpen).toBeTrue();

    dispatch(closeInviteEditMember());
    expect(getState().isOpen).toBeFalse();

    dispatch(inviteStudyMember({ email: 'test@example.com', role: 'team-admin' }));
    expect(getState().isSending).toBeTrue();

    dispatch(removeStudyMember({ id: 'test' }));
  });
});
