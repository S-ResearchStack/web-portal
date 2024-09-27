import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import {
  LabVisitItem,
  LabVisitListFetchArgs,
  LabVisitParticipantSuggestionFetchArgs,
  transformLabVisitItemFromApi,
  useLabVisitParticipantSuggestions,
  useLabVisitsList,
  useSaveLabVisit,
} from './labVisit.slice';

const setUpHook = <T extends () => ReturnType<T>>(useHook: () => ReturnType<T>) =>
  renderHook(() => useHook(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  'reset' in hook.result.current && hook.result.current.reset();
  hook.unmount();
};

const projectId = 'test-study';

describe('useLabVisitsList', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should load list of items', async () => {
    const fetchArgs: LabVisitListFetchArgs = {
      studyId: projectId,
      sort: {
        column: 'subjectNumber', direction: 'asc'
      },
      filter: {
        page: 0, size: 10
      }
    };

    hook = setUpHook(() => useLabVisitsList());

    await act(async () => {
      await hook.result.current.fetch(fetchArgs);
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: undefined,
      data: expect.any(Object),
    });
  });

  it('[NEGATIVE] should catch error while loading', async () => {
    const fetchArgs: LabVisitListFetchArgs = {
      studyId: projectId,
      sort: {
        column: 'subjectNumber', direction: 'asc'
      },
      filter: {
        page: 0, size: 10
      }
    };

    hook = setUpHook(() => useLabVisitsList());

    await act(async () => {
      await maskEndpointAsSuccess(
        'getLabVisits',
        async () => {
          await hook.result.current.fetch(fetchArgs);
        },
        { response: null }
      );
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: expect.any(String),
      data: undefined,
    });
  });
});

describe('useSaveLabVisit', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  const dataToSave: Partial<LabVisitItem> = {
    subjectNumber: 'participant',
    startTime: Date.now(),
    endTime: Date.now(),
    picId: 'John',
    note: 'note',
    filePaths: [],
  };

  it('should save item', async () => {
    hook = setUpHook(() => useSaveLabVisit());

    await act(async () => {
      await hook.result.current.save(dataToSave);
    });

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should catch error while sending', async () => {
    hook = setUpHook(() => useSaveLabVisit());

    await act(async () => {
      await maskEndpointAsFailure(
        'createLabVisit',
        async () => {
          await hook.result.current.save(dataToSave);
        },
        { status: 400, message: 'error' }
      );
    });

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: expect.any(String),
    });
  });

  it('should update item', async () => {
    hook = setUpHook(() => useSaveLabVisit());
    dataToSave.id = 1;
    await act(async () => {
      await hook.result.current.save(dataToSave);
    });

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should catch error while sending to update item', async () => {
    hook = setUpHook(() => useSaveLabVisit());
    dataToSave.id = 1;
    await act(async () => {
      await maskEndpointAsFailure(
        'updateLabVisit',
        async () => {
          await hook.result.current.save(dataToSave);
        },
        { status: 400, message: 'error' }
      );
    });

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: expect.any(String),
    });
  });
});

describe('useLabVisitParticipantSuggestions', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  const fetchArgs: LabVisitParticipantSuggestionFetchArgs = {
    studyId: projectId,
  };

  it('should load list of items', async () => {
    hook = setUpHook(() => useLabVisitParticipantSuggestions());

    await act(async () => {
      await hook.result.current.fetch(fetchArgs);
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: undefined,
      data: expect.any(Object),
    });
  });

  it('[NEGATIVE] should catch error while loading', async () => {
    hook = setUpHook(() => useLabVisitParticipantSuggestions());

    await act(async () => {
      await maskEndpointAsFailure(
        'getSubjectInfoList',
        async () => {
          await hook.result.current.fetch(fetchArgs);
        },
        { status: 400, message: 'error' }
      );
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: expect.any(String),
      data: undefined,
    });
  });
});
