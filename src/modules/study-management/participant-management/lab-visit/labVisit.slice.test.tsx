import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import { healthDataOverviewListMock } from 'src/modules/overview/participantsList.slice';
import {
  getLabVisitsListMock,
  LabVisitItem,
  LabVisitListFetchArgs,
  LabVisitParticipantSuggestionFetchArgs,
  transformLabVisitItemFromApi,
  transformParticipantSuggestionsFromApi,
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
      projectId,
    };

    hook = setUpHook(() => useLabVisitsList());

    await act(async () => {
      await hook.result.current.fetch(fetchArgs);
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: undefined,
      data: {
        list: (await getLabVisitsListMock(fetchArgs)).data.map((i) =>
          transformLabVisitItemFromApi(i, [])
        ),
      },
    });
  });

  it('[NEGATIVE] should catch error while loading', async () => {
    const fetchArgs: LabVisitListFetchArgs = {
      projectId,
    };

    hook = setUpHook(() => useLabVisitsList());

    await act(async () => {
      await maskEndpointAsSuccess(
        'getLabVisitsList',
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

  const dataToSave: LabVisitItem = {
    visitId: 1,
    participantId: 'participant',
    startTs: Date.now(),
    endTs: Date.now(),
    checkInBy: 'John',
    notes: 'note',
    filesPath: 'in-lab-visit/1',
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
        'updateLabVisit',
        async () => {
          await hook.result.current.save(dataToSave);
        },
        { status: 500, message: 'error' }
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
      data: transformParticipantSuggestionsFromApi(healthDataOverviewListMock),
    });
  });

  it('[NEGATIVE] should catch error while loading', async () => {
    hook = setUpHook(() => useLabVisitParticipantSuggestions());

    await act(async () => {
      await maskEndpointAsFailure(
        'getHealthDataParticipantIds',
        async () => {
          await hook.result.current.fetch(fetchArgs);
        },
        { status: 500, message: 'error' }
      );
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: expect.any(String),
      data: undefined,
    });
  });
});
