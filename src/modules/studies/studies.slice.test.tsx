import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

import { AppDispatch, store } from 'src/modules/store/store';
import * as api from 'src/modules/api';
import { SpecColorType } from 'src/styles/theme';

import { currentSnackbarSelector } from 'src/modules/snackbar/snackbar.slice';
import { maskEndpointAsFailure } from 'src/modules/api/mock';

import reducer, {
  mockStudies,
  fetchStudies,
  initialState,
  StudiesState,
  studiesSelector,
  transformStudyFromApi,
  selectedStudyIdSelector,
  setSelectedStudyId,
  selectedStudySelector,
  createStudy,
  Study,
  useSelectedStudyId,
  fetchStudiesStarted,
  fetchStudiesFinished,
  studiesSlice,
} from './studies.slice';

const TEST_ERR_TEXT_MESSAGE = 'test-error';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;
const studiesMock = mockStudies.map(transformStudyFromApi);

describe('Studies redux state slice tests', () => {
  it('should have initial state', async () => {
    expect(reducer(initialState, { type: '' })).toEqual({
      studies: [],
      isLoading: false,
    } as StudiesState);
  });

  it('should have loading state', async () => {
    expect(reducer(initialState, fetchStudiesStarted())).toEqual({
      studies: [],
      isLoading: true,
    } as StudiesState);
  });

  it('should insert data to state', async () => {
    expect(reducer(initialState, fetchStudiesFinished(studiesMock))).toEqual({
      studies: studiesMock,
      selectedStudyId: studiesMock[0].id,
      isLoading: false,
    } as StudiesState);
  });

  it('should transform data from API to state type', () => {
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

  it('should fetch state from API', async () => {
    await dispatch(fetchStudies());

    expect(studiesSelector(store.getState())).toEqual(studiesMock);
  });

  it('should prevent update state from API', async () => {
    const beforeStudies = studiesSelector(store.getState());

    await dispatch(fetchStudies());

    const afterStudies = studiesSelector(store.getState());

    expect(beforeStudies).toBe(afterStudies);
  });

  it('should force update state from API', async () => {
    const beforeStudies = studiesSelector(store.getState());

    await dispatch(fetchStudies({ force: true }));

    const afterStudies = studiesSelector(store.getState());

    expect(beforeStudies).not.toBe(afterStudies);
  });

  it('should reset state', async () => {
    await dispatch(fetchStudies());

    expect(studiesSelector(store.getState())).toEqual(studiesMock);

    dispatch(studiesSlice.actions.reset());

    expect(studiesSelector(store.getState())).toHaveLength(0);
  });

  it('should catch an error when trying to force update state from API', async () => {
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

  it('should create study', async () => {
    const study: Omit<Study, 'id'> = {
      name: 'test-study-name',
      color: 'primary',
    };

    await dispatch(createStudy(study));

    expect(selectedStudySelector(store.getState())).toMatchObject(study);
  });

  it('should catch an error when trying to create a study', async () => {
    const study: Omit<Study, 'id'> = {
      name: 'test-study-name',
      color: 'primary',
    };

    await maskEndpointAsFailure('createStudy', async () => {
      await dispatch(createStudy(study));
    });

    expect(selectedStudySelector(store.getState())).toMatchObject(study);
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
