import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import { store } from 'src/modules/store/store';
import { PublicationContentSource } from 'src/modules/api';
import {
  createEducationSelector,
  createPublicationSlice,
  useCreatePublication,
} from './createPublication.slice';
import { editedPublicationSelector } from './education-editor/educationEditor.slice';
import { educationListDataSelector } from './educationList.slice';

describe('createPublicationSlice', () => {
  it('should make empty state', () => {
    expect(createPublicationSlice.reducer(undefined, { type: 0 })).toEqual({
      isCreating: false,
    });
  });

  it('[NEGATIVE] should select from empty slice', async () => {
    expect(educationListDataSelector({} as ReturnType<typeof store.getState>)).toBeUndefined();
  });
});

const setUpHook = () =>
  renderHook(() => useCreatePublication(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const projectId = 'test-study';

const source: PublicationContentSource = 'SCRATCH';

const error = 'test-error';

const unsetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.unmount();
};

describe('useCreatePublication', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(async () => {
    await act(() => unsetHook(hook));
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    hook = setUpHook();
    await maskEndpointAsSuccess(
      'createPublication',
      async () => {
        await act(() => {
          hook.result.current.create({ projectId, source });
        });

        await waitFor(() => expect(hook.result.current.isCreating).toBeFalsy());
      },
      { response: null }
    );

    expect(editedPublicationSelector(store.getState())).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch data while request is failure', async () => {
    hook = setUpHook();
    await maskEndpointAsFailure(
      'createPublication',
      async () => {
        await act(() => {
          hook.result.current.create({ projectId, source });
        });

        await waitFor(() => expect(hook.result.current.isCreating).toBeFalsy());
      },
      { message: error }
    );

    expect(editedPublicationSelector(store.getState()).id).toBeEmpty();
  });

  it('should create publication', async () => {
    expect(createEducationSelector(store.getState()).isCreating).toBeFalse();
    expect(store.getState()['studyManagement/educationEditor'].data).toBeFalsy();
    hook = setUpHook();

    await act(() => {
      hook.result.current.create({ projectId, source });
    });

    await waitFor(() => expect(createEducationSelector(store.getState()).isCreating).toBeFalse());

    expect(store.getState()['studyManagement/educationEditor'].data).toEqual({
      studyId: 'test-study',
      status: expect.any(String),
      source: 'SCRATCH',
      revisionId: expect.any(Number),
      id: expect.any(String),
      title: expect.any(String),
      educationContent: [
        {
          id: expect.any(String),
          children: [
            {
              id: expect.any(String),
              sequence: 0,
              text: '',
              type: 'TEXT',
            },
          ],
        },
      ],
    });
  });
});
