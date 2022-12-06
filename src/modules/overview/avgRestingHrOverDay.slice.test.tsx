import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  getParticipantHeartRatesMock,
  useAvgRestingHrOverDaySlice,
} from 'src/modules/overview/avgRestingHrOverDay.slice';
import { store } from 'src/modules/store/store';

describe('getParticipantHeartRatesMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getParticipantHeartRatesMock({
      startTime: '2017-05-15',
      endTime: '2017-05-16',
      projectId: 'project-id',
    });

    expect({ data }).toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({
          user_id: expect.any(String),
          time: expect.any(String),
          gender: expect.any(String),
          age: expect.any(String),
          bpm: expect.any(String),
        }),
      ]),
    });
  });
});

const setUpHook = (args: { studyId: string }) =>
  renderHook(
    (etchArgs: { studyId: string }) =>
      useAvgRestingHrOverDaySlice({
        fetchArgs: etchArgs || args,
      }),
    {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
        <Provider store={store}>{children}</Provider>
      ),
    }
  );

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

describe('useAvgRestingHrOverDaySlice', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should fetch data from API', async () => {
    hook = setUpHook({
      studyId: 'test-study-id',
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: {
        timeDomain: expect.arrayContaining([expect.any(Number), expect.any(Number)]),
        values: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            ts: expect.any(Number),
            value: expect.any(Number),
            min: expect.any(Number),
            max: expect.any(Number),
            lastSync: expect.any(Number),
            color: expect.any(String),
          }),
        ]),
      },
    });
  });
});
