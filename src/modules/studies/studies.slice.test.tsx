import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

import { AppDispatch, store } from 'src/modules/store/store';
import * as api from 'src/modules/api';
import { SpecColorType } from 'src/styles/theme';
import { currentSnackbarSelector } from 'src/modules/snackbar/snackbar.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

import { mockStudies } from './studies.slice.mock';
import reducer, {
  fetchStudies,
  initialState,
  StudiesState,
  studiesSelector,
  transformStudyFromApi,
  setSelectedStudyId,
  selectedStudySelector,
  createStudy,
  Study,
  useSelectedStudyId,
  fetchStudiesStarted,
  fetchStudiesFinished,
  studiesSlice,
  reset,
  selectedStudyIdSelector,
} from './studies.slice';

const TEST_ERR_TEXT_MESSAGE = 'test-error';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;
const studiesMock = mockStudies.map(transformStudyFromApi);

describe('transformStudyFromApi', () => {
  it('should transform data', () => {
    const fromWithColor: api.Study = {
      id: { value: '1' },
      name: 'SleepCare Study',
      info: {
        color: 'secondarySkyBlue',
      },
      isOpen: true,
    };

    const fromWithoutColor: api.Study = {
      id: { value: '1' },
      name: 'SleepCare Study',
      info: {},
      isOpen: true,
    };

    const toWithColor: Study = {
      id: fromWithColor.id.value,
      name: fromWithColor.name,
      color: fromWithColor.info.color as SpecColorType,
    };

    const toWithoutColor: Study = {
      id: fromWithoutColor.id.value,
      name: fromWithoutColor.name,
      color: 'disabled',
    };

    expect(transformStudyFromApi(fromWithColor)).toEqual(toWithColor);
    expect(transformStudyFromApi(fromWithoutColor)).toEqual(toWithoutColor);
  });

  it('[NEGATIVE] should transform wrong data', () => {
    const toWithoutColor = {
      id: '',
      name: undefined,
      color: 'disabled',
    };

    expect(transformStudyFromApi({} as unknown as api.Study)).toEqual(toWithoutColor);
  });
});

describe('store', () => {
  afterEach(() => {
    dispatch(reset());
  });

  it('should support success lifecycle', async () => {
    let currentState = reducer(initialState, { type: '' });

    expect(currentState).toEqual({
      studies: [],
      isLoading: false,
    } as StudiesState);

    currentState = reducer(initialState, fetchStudiesStarted());

    expect(currentState).toEqual({
      studies: [],
      isLoading: true,
    } as StudiesState);

    currentState = reducer(initialState, fetchStudiesFinished(studiesMock));

    expect(currentState).toEqual({
      studies: studiesMock,
      selectedStudyId: studiesMock[0].id,
      isLoading: false,
    } as StudiesState);
  });

  it('[NEGATIVE] should support failure lifecycle', async () => {
    let currentState = reducer(initialState, { type: '' });

    expect(currentState).toEqual({
      studies: [],
      isLoading: false,
    } as StudiesState);

    currentState = reducer(initialState, fetchStudiesStarted());

    expect(currentState).toEqual({
      studies: [],
      isLoading: true,
    } as StudiesState);

    currentState = reducer(
      initialState,
      fetchStudiesFinished(null as unknown as typeof studiesMock)
    );

    expect(currentState).toEqual({
      studies: null,
      selectedStudyId: undefined,
      isLoading: false,
    });
  });

  it('should fetch state from API', async () => {
    await dispatch(fetchStudies());

    expect(studiesSelector(store.getState())).toEqual(studiesMock);
  });

  it('[NEGATIVE] should fetch wrong data from API', async () => {
    await maskEndpointAsSuccess(
      'getStudies',
      async () => {
        await dispatch(fetchStudies());
      },
      { response: null }
    );

    expect(studiesSelector(store.getState())).toEqual([]);
  });

  it('[NEGATIVE] should fetch data while failure request', async () => {
    await maskEndpointAsFailure(
      'getStudies',
      async () => {
        await dispatch(fetchStudies());
      },
      { message: 'error' }
    );

    expect(studiesSelector(store.getState())).toEqual([]);
  });

  it('should support cache mechanism', async () => {
    await dispatch(fetchStudies());

    const beforeStudies = studiesSelector(store.getState());

    await dispatch(fetchStudies());

    const afterStudies = studiesSelector(store.getState());

    expect(beforeStudies).toBe(afterStudies);

    await maskEndpointAsFailure(
      'getStudies',
      async () => {
        await dispatch(fetchStudies({ force: true }));
      },
      { message: 'error' }
    );

    expect(afterStudies).not.toBe(studiesSelector(store.getState()));
  });

  it('[NEGATIVE] should support cache mechanism while request failure', async () => {
    await dispatch(fetchStudies());

    await dispatch(fetchStudies());

    const beforeStudies = studiesSelector(store.getState());

    await dispatch(fetchStudies());

    const afterStudies = studiesSelector(store.getState());

    expect(beforeStudies).toBe(afterStudies);

    await dispatch(fetchStudies({ force: true }));

    expect(afterStudies).not.toBe(studiesSelector(store.getState()));
  });

  it('should reset state', async () => {
    await dispatch(fetchStudies());

    expect(studiesSelector(store.getState())).toEqual(studiesMock);

    dispatch(studiesSlice.actions.reset());

    expect(studiesSelector(store.getState())).toHaveLength(0);
  });

  it('[NEGATIVE] should reset empty state', async () => {
    expect(studiesSelector(store.getState())).toEqual(initialState.studies);

    dispatch(studiesSlice.actions.reset());

    expect(studiesSelector(store.getState())).toHaveLength(0);
  });

  it('[NEGATIVE] should catch an error when trying to force update state from API', async () => {
    await maskEndpointAsFailure(
      'getStudies',
      async () => {
        await dispatch(fetchStudies({ force: true }));
      },
      { message: TEST_ERR_TEXT_MESSAGE }
    );

    const afterStudies = studiesSelector(store.getState());
    const currentSnackbar = currentSnackbarSelector(store.getState());

    expect(afterStudies).toHaveLength(0);
    expect(currentSnackbar.text).toMatch(TEST_ERR_TEXT_MESSAGE);
  });

  it('should set default selected study', async () => {
    await dispatch(fetchStudies({ force: true }));
    expect(selectedStudyIdSelector(store.getState())).toEqual(studiesMock[0].id);
  });

  it('should switch current study', async () => {
    await dispatch(fetchStudies({ force: true }));

    const studies = studiesSelector(store.getState());
    const selectedStudyIdx = studies.length - 1;
    const selectedStudyId = studies[selectedStudyIdx].id;

    dispatch(setSelectedStudyId(selectedStudyId));

    expect(selectedStudySelector(store.getState())).toEqual(studies[selectedStudyIdx]);
  });

  it('[NEGATIVE] should switch current study with wrong study id', async () => {
    await dispatch(fetchStudies({ force: true }));

    dispatch(setSelectedStudyId('unknown'));

    expect(selectedStudySelector(store.getState())).toEqual(undefined);
  });

  it('should create study', async () => {
    const study: Omit<Study, 'id'> = {
      name: 'test-study-name',
      color: 'primary',
    };

    await dispatch(createStudy(study));

    expect(selectedStudySelector(store.getState())).toMatchObject(study);
  });

  it('[NEGATIVE] should catch an error when trying to create a study', async () => {
    const study: Omit<Study, 'id'> = {
      name: 'test-study-name',
      color: 'primary',
    };

    await maskEndpointAsFailure(
      'getStudies',
      async () => {
        await dispatch(createStudy(study));
      },
      { message: 'error' }
    );

    expect(selectedStudyIdSelector(store.getState())).toBeUndefined();
    expect(selectedStudySelector(store.getState())).toBeUndefined();
  });

  it('should use `useSelectedStudyId` hook', async () => {
    const view = renderHook(() => useSelectedStudyId(), {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

    expect(view.result.current).toEqual(selectedStudyIdSelector(store.getState()));

    act(() => view.unmount());
  });
});
