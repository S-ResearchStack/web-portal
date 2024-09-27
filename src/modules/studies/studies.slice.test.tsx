import React from 'react';
import { Provider } from 'react-redux';
import { DateTime } from 'luxon';
import { act, renderHook } from '@testing-library/react';
import { AppDispatch, store } from 'src/modules/store/store';
import * as api from 'src/modules/api';
import { SpecColorType } from 'src/styles/theme';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

import { authSlice } from '../auth/auth.slice';
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
  StudyObject,
  useSelectedStudyId,
  fetchStudiesStarted,
  fetchStudiesFinished,
  studiesSlice,
  reset,
  selectedStudyIdSelector,
  durationUnitFirstKey,
  durationUnitSecondKey,
  ParticipationApprovalType,
  periodUnitKey,
  StudyScope,
  IRBDecision,
} from './studies.slice';

const TEST_ERR_TEXT_MESSAGE = 'test-error';

const authToken =
  'test token';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;
const studiesMock = mockStudies.map(transformStudyFromApi);

describe('transformStudyFromApi', () => {
  afterAll(() => {
    dispatch(authSlice.actions.clearAuth());
  });

  it('should transform data', () => {
    const fromWithColor: api.Study = {
      id: '1',
      participationCode: 'secret',
      studyInfoResponse: {
        name: 'SleepCare Study',
        description: 'test study description',
        participationApprovalType: 'AUTO',
        scope: 'PUBLIC',
        stage: 'STARTED_OPEN',
        logoUrl: 'secondarySkyBlue',
        organization: 'SV',
        imageUrl: '',
        period: '10 day(s)',
        duration: '10 minute(s)/day',
      },
      irbInfoResponse: {
        decisionType: 'APPROVED',
        decidedAt: '2024-04-07T05:35:02.620569',
        expiredAt: '2024-04-07T05:35:02.620569'
      },
      createdAt: '2023-04-07T05:35:02.620569'
    };

    const fromWithoutColor: api.Study = {
      id: '1',
      participationCode: 'secret',
      studyInfoResponse: {
        name: 'SleepCare Study',
        description: 'test study description',
        participationApprovalType: 'AUTO',
        scope: 'PUBLIC',
        stage: 'STARTED_OPEN',
        logoUrl: '',
        imageUrl: '',
        organization: "",
        duration: "",
        period: "",
        requirements: []
      },
      irbInfoResponse: {
        decisionType: 'APPROVED',
        decidedAt: '2024-04-07T05:35:02.620569',
        expiredAt: '2024-04-07T05:35:02.620569'
      },
      createdAt: '2023-04-07T05:35:02.620569'
    };

    const toWithColor: Study = {
      id: fromWithColor.id,
      name: fromWithColor.studyInfoResponse.name,
      color: fromWithColor.studyInfoResponse.logoUrl as SpecColorType,
      createdAt: DateTime.fromISO(fromWithColor.createdAt ?? DateTime.now().toISODate(), { zone: 'utc' }).toMillis(),
    };

    const toWithoutColor: Study = {
      id: fromWithoutColor.id,
      name: fromWithoutColor.studyInfoResponse.name,
      color: 'secondarySkyBlue',
      createdAt: DateTime.fromISO(fromWithoutColor.createdAt ?? DateTime.now().toISODate(), { zone: 'utc' }).toMillis(),
    };

    expect(transformStudyFromApi(fromWithColor)).toEqual(toWithColor);
    expect(transformStudyFromApi(fromWithoutColor)).toEqual(toWithoutColor);
  });

  it('[NEGATIVE] should transform wrong data', () => {
    expect(transformStudyFromApi({} as unknown as api.Study)).toEqual(
      expect.objectContaining({
        id: undefined,
        name: undefined,
        color: 'secondarySkyBlue',
        createdAt: expect.any(Number),
      })
    );
  });
});

describe('store', () => {
  afterEach(() => {
    dispatch(reset());
  });

  it('should support success lifecycle', async () => {
    let currentState = reducer.studies(initialState, { type: '' });

    expect(currentState).toEqual({
      studies: [],
      isLoading: false,
    } as StudiesState);

    currentState = reducer.studies(initialState, fetchStudiesStarted());

    expect(currentState).toEqual({
      studies: [],
      isLoading: true,
    } as StudiesState);

    currentState = reducer.studies(initialState, fetchStudiesFinished(studiesMock));

    expect(currentState).toEqual({
      studies: studiesMock,
      selectedStudyId: studiesMock[0].id,
      isLoading: false,
    } as StudiesState);
  });

  it('[NEGATIVE] should support failure lifecycle', async () => {
    let currentState = reducer.studies(initialState, { type: '' });

    expect(currentState).toEqual({
      studies: [],
      isLoading: false,
    } as StudiesState);

    currentState = reducer.studies(initialState, fetchStudiesStarted());

    expect(currentState).toEqual({
      studies: [],
      isLoading: true,
    } as StudiesState);

    currentState = reducer.studies(
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
    expect(afterStudies).toHaveLength(0);
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
    dispatch(
      authSlice.actions.authSuccess({ jwtType: '', authToken, refreshToken: authToken })
    );

    const study: Omit<StudyObject, 'createdAt'> = {
      studyName: "test",
      studyID: "test123",
      participationCode: "secret",
      description: "",
      participationApprovalType: ParticipationApprovalType.AUTOMATIC,
      studyScope: StudyScope.PUBLIC,
      stage: "CREATED",
      studyLogo: "",
      studyImage: "",
      orgName: "SRV",
      duration: { amount: 10, durationUnitFirst: durationUnitFirstKey.MINUTE, durationUnitSecond: durationUnitSecondKey.DAY },
      period: { amount: 1, periodUnit: periodUnitKey.DAY },
      studyRequirements: "Anyone can participate in",
      irbDecision: IRBDecision.APPROVED,
    };

    await dispatch(createStudy(study));

    expect(selectedStudySelector(store.getState())).toEqual(expect.objectContaining({
      id: study.studyID,
    }));

    dispatch(authSlice.actions.clearAuth());
  });

  it('[NEGATIVE] should catch an error when trying to create a study', async () => {
    const study: Omit<StudyObject, 'createdAt'> = {
      studyName: "test",
      studyID: "test123",
      participationCode: "secret",
      description: "",
      participationApprovalType: ParticipationApprovalType.AUTOMATIC,
      studyScope: StudyScope.PUBLIC,
      stage: "CREATED",
      studyLogo: "",
      studyImage: "",
      orgName: "SRV",
      duration: { amount: 10, durationUnitFirst: durationUnitFirstKey.MINUTE, durationUnitSecond: durationUnitSecondKey.DAY },
      period: { amount: 1, periodUnit: periodUnitKey.DAY },
      studyRequirements: "Anyone can participate in",
      irbDecision: IRBDecision.APPROVED,
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
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

    expect(view.result.current).toEqual(selectedStudyIdSelector(store.getState()));

    act(() => view.unmount());
  });
});
