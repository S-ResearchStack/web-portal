import {DateTime} from 'luxon';
import _first from 'lodash/first';
import _uniqueId from 'lodash/uniqueId';
import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';
import {push} from 'connected-react-router';

import {SpecColorType} from 'src/styles/theme';
import {
  AppThunk,
  RootState,
  useAppSelector,
  WithLoading,
  ErrorType,
  useAppDispatch,
} from 'src/modules/store';
import API from 'src/modules/api';
import * as api from 'src/modules/api/models';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import {updateTokens} from 'src/modules/auth/auth.slice';
import {mockStudies} from 'src/modules/studies/studies.slice.mock';
import {Path} from 'src/modules/navigation/store';
import {decodeAuthToken} from '../auth/utils';
import {NEW_STUDY_QUERY_PARAM_NAME} from '../study-settings/utils';

const SELECTED_STUDY_KEY = 'selected_study';

API.mock.provideEndpoints({
  getStudies() {
    return API.mock.response(mockStudies)
  },
  createStudy(req) {
    const s = {
      id: req.id,
      studyInfoResponse: {
        name: req.name,
        description: req.description,
        participationApprovalType: req.participationApprovalType,
        scope: req.scope,
        stage: req.stage,
        logoUrl: req.logoUrl || 'secondarySkyBlue',
        organization: req.organization,
        imageUrl: req.imageUrl || '',
        duration: req.duration,
        period: req.period,
      },
      irbInfoResponse: {
        decisionType: req.irbDecisionType,
        decidedAt: req.irbDecidedAt?.toISOString() || '',
        expiredAt: req.irbExpiredAt?.toISOString() || ''
      },
    };
    mockStudies.push(s);
    return API.mock.response(undefined);
  },
  updateStudy() {
    return API.mock.response(undefined);
  },
  getStudy({ studyId }) {
    const s = mockStudies.find(s => s.id === studyId);
    return !s
      ? API.mock.failedResponse({ status: 404, message: 'Not found' })
      : API.mock.response(s);
  },
});

export enum StudyScope {
  PRIVATE = "PRIVATE" , 
  PUBLIC = "PUBLIC"
};
export enum ParticipationApprovalType {
  AUTOMATIC = "AUTO" , 
  MANUAL = "MANUAL"
};
export enum IRBDecision {
  EXEMPT = "EXEMPT",
  APPROVED = "APPROVED"
}
export enum durationUnitFirstKey {
  MINUTE = "minute(s)",
  HOUR = "hour(s)"
}
export enum durationUnitSecondKey {
  DAY = "day",
  WEEK = "week",
  MONTH = "month"
}
export enum periodUnitKey {
  DAY = "day(s)",
  WEEK = "week(s)",
  MONTH = "month(s)"
}

type DurationObject = {
  amount: number,
  durationUnitFirst: durationUnitFirstKey,
  durationUnitSecond: durationUnitSecondKey
}
type PeriodObject = {
  amount: number,
  periodUnit: periodUnitKey,
}

export type Study = {
  id: string;
  name: string;
  color: SpecColorType;
  createdAt: number;
};

export interface StudyObject {
  studyName: string
  studyID: string
  description?: string
  orgName: string
  studyLogo?: string
  studyImage?: string
  studyScope: StudyScope
  participationCode: string
  participationApprovalType: ParticipationApprovalType
  duration: DurationObject
  period: PeriodObject
  studyRequirements: string
  irbDecision: IRBDecision
  stage: string
  irbDecidedAt?: Date
  irbExpiredAt?: Date
}

export type StudiesState = {
  studies: Study[];
  isLoading: boolean;
  selectedStudyId?: string;
};

export const initialState: StudiesState = {
  studies: [],
  isLoading: false,
};

export const studiesSlice = createSlice({
  name: 'studies',
  initialState,
  reducers: {
    fetchStudiesStarted(state) {
      state.isLoading = true;
    },
    fetchStudiesFinished(state, {payload: newStudies}: PayloadAction<Study[]>) {
      state.isLoading = false;
      state.studies = newStudies;
      if (!newStudies?.find((s) => s.id === state.selectedStudyId)) {
        const savedStudyId = localStorage.getItem(SELECTED_STUDY_KEY);
        const savedStudy = newStudies?.find((study) => savedStudyId === study.id);
        state.selectedStudyId = savedStudy ? savedStudy.id: _first(newStudies)?.id;
      }
    },
    setSelectedStudyId(state, action: PayloadAction<string | undefined>) {
      state.selectedStudyId = action.payload;
      if (action.payload) {
        localStorage.setItem(SELECTED_STUDY_KEY, action.payload);
      } else {
        localStorage.removeItem(SELECTED_STUDY_KEY);
      }
    },
    reset(state) {
      state.studies = [];
      state.isLoading = false;
      state.selectedStudyId = undefined;
      localStorage.removeItem(SELECTED_STUDY_KEY);
    },
  },
});

export const {fetchStudiesStarted, fetchStudiesFinished, setSelectedStudyId, reset} =
  studiesSlice.actions;

export const transformStudyFromApi = (s: api.Study): Study => {
  return {
    id: s.id,
    name: s.studyInfoResponse?.name,
    color: s.studyInfoResponse?.logoUrl as SpecColorType || "secondarySkyBlue",
    createdAt: s.createdAt ? DateTime.fromISO(s.createdAt, {zone: 'utc'}).toMillis() : Date.now(),
  }};

export const fetchStudies =
  (opts?: { force?: boolean }): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
      if (!opts?.force) {
        const {studies, isLoading} = getState().studies;
        if (studies?.length || isLoading) {
          return;
        }
      }

      dispatch(fetchStudiesStarted());

      try {
        const {data} = await API.getStudies();
        const studies =
          data
            // .filter((s) => s.isOpen) // TODO: uncomment once test data is in open project
            ?.map(transformStudyFromApi) ?? [];

        dispatch(fetchStudiesFinished(studies));
      } catch (e) {
        dispatch(fetchStudiesFinished([]));
        applyDefaultApiErrorHandlers(e, dispatch);
      }
    };

const createStudyInitialState: WithLoading = {};
const createStudySlice = createSlice({
  name: 'createStudy',
  initialState: createStudyInitialState,
  reducers: {
    createStudyStart(state) {
      state.isLoading = true;
      state.error = undefined;
    },
    createStudySuccess(state) {
      state.isLoading = false;
    },
    createStudyError(state, {payload}: PayloadAction<ErrorType>) {
      state.isLoading = false;
      state.error = payload;
    },
  },
});
const transformStudyDuration = (duration: DurationObject) => {
  return duration.amount + " " + duration.durationUnitFirst + "/" + duration.durationUnitSecond;
}
const transformStudyPeriod = (period: PeriodObject) => {
  return period.amount + " " + period.periodUnit;
}
export const createStudy =
  (s: Omit<StudyObject, 'id' | 'createdAt'>): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
      let newStudyId;
      try {
        dispatch(createStudySlice.actions.createStudyStart());
        const studyRes = await API.createStudy({
          name: s.studyName,
          id: s.studyID,
          participationCode: s.participationCode,
          description: s.description || "",
          participationApprovalType: s.participationApprovalType,
          scope: s.studyScope,
          stage: "STARTED_OPEN",
          logoUrl: "",
          imageUrl: "",
          organization: s.orgName,
          duration: transformStudyDuration(s.duration),
          period: transformStudyPeriod(s.period),
          requirements: [s.studyRequirements],
          irbDecisionType: s.irbDecision,
          irbDecidedAt: s.irbDecidedAt,
          irbExpiredAt: s.irbExpiredAt,
          startDate: new Date().toISOString(),
        });
        studyRes.checkError();
        await dispatch(updateTokens());
        await dispatch(fetchStudies({force: true}));
        newStudyId = getState().studies.studies.find((ss) => ss.id === s.studyID)?.id;
      } catch (err) {
        applyDefaultApiErrorHandlers(err, dispatch);
        dispatch(createStudySlice.actions.createStudyError(String(err)));
        return;
      }

      try {
        const {authToken} = getState().auth;
        const accountId = decodeAuthToken(authToken || '')?.sub;
        if (!accountId) {
          throw new Error(`Cannot read user id from auth token`);
        }
        await dispatch(updateTokens());
      } catch (err) {
        applyDefaultApiErrorHandlers(err, dispatch);
      }

      // TODO: Even role update might failed we still navigate user to new screen. In the future it would be good to keep operation atomic or provide more meaningful error.
      dispatch(createStudySlice.actions.createStudySuccess());
      dispatch(setSelectedStudyId(newStudyId));
      dispatch(push(`${Path.StudySettings}?${NEW_STUDY_QUERY_PARAM_NAME}=true`));
    };

const createStudyStateSelector = (state: RootState) => state[createStudySlice.name];

export const useCreateStudy = () => {
  const dispatch = useAppDispatch();
  const signUpState = useSelector(createStudyStateSelector);
  return {
    ...signUpState,
    createStudy: async (...data: Parameters<typeof createStudy>) => dispatch(createStudy(...data)),
  };
};

export const selectStudy = setSelectedStudyId;

export const studiesIsLoadingSelector = (state: RootState) => state.studies.isLoading;

export const studiesSelector = (state: RootState) => state.studies.studies;

export const isLoadingSelector = (state: RootState) => state.studies.isLoading;

export const selectedStudySelector = createSelector(
  [
    (state: RootState) => state.studies.studies,
    (state: RootState) => state.studies.selectedStudyId,
  ],
  (studies, selectedStudyId) => studies.find((s) => s.id=== selectedStudyId)
);

export const selectedStudyIdSelector = (state: RootState) => selectedStudySelector(state)?.id;
export const useSelectedStudyId = () => useAppSelector(selectedStudyIdSelector);

export default {
  [studiesSlice.name]: studiesSlice.reducer,
  [createStudySlice.name]: createStudySlice.reducer,
};
