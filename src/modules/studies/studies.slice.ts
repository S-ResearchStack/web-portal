import { DateTime } from 'luxon';
import _first from 'lodash/first';
import _uniqueId from 'lodash/uniqueId';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { push } from 'connected-react-router';

import { SpecColorType } from 'src/styles/theme';
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
import { updateTokens } from 'src/modules/auth/auth.slice';
import { mockStudies } from 'src/modules/studies/studies.slice.mock';
import { Path } from 'src/modules/navigation/store';
import { roleToApi, RoleType } from '../auth/userRole';
import { decodeAuthToken } from '../auth/utils';
import { NEW_STUDY_QUERY_PARAM_NAME } from '../study-settings/utils';

const SELECTED_STUDY_KEY = 'selected_study';

API.mock.provideEndpoints({
  getStudies() {
    return API.mock.response(mockStudies);
  },
  createStudy(req) {
    const s = {
      id: { value: _uniqueId('study') },
      isOpen: true,
      createdAt: '2023-04-07T05:35:02.620569',
      ...req,
    };
    mockStudies.push(s);
    return API.mock.response(undefined);
  },
  updateUserRole() {
    return API.mock.response(undefined);
  },
});

export type Study = {
  id: string;
  name: string;
  color: SpecColorType;
  createdAt: number;
};

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
    fetchStudiesFinished(state, { payload: newStudies }: PayloadAction<Study[]>) {
      state.isLoading = false;
      state.studies = newStudies;
      if (!newStudies?.find((s) => s.id === state.selectedStudyId)) {
        const savedStudyId = localStorage.getItem(SELECTED_STUDY_KEY);
        const savedStudy = newStudies?.find((study) => savedStudyId === study.id);
        state.selectedStudyId = savedStudy ? savedStudy.id : _first(newStudies)?.id;
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

export const { fetchStudiesStarted, fetchStudiesFinished, setSelectedStudyId, reset } =
  studiesSlice.actions;

export const transformStudyFromApi = (s: api.Study): Study => ({
  id: String(s.id?.value || ''),
  name: s.name,
  color: (s.info?.color as SpecColorType) || 'disabled',
  createdAt: s.createdAt ? DateTime.fromISO(s.createdAt, { zone: 'utc' }).toMillis() : Date.now(),
});

export const fetchStudies =
  (opts?: { force?: boolean }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (!opts?.force) {
      const { studies, isLoading } = getState().studies;
      if (studies?.length || isLoading) {
        return;
      }
    }

    dispatch(fetchStudiesStarted());

    try {
      const { data } = await API.getStudies();
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
    createStudyError(state, { payload }: PayloadAction<ErrorType>) {
      state.isLoading = false;
      state.error = payload;
    },
  },
});

export const createStudy =
  (s: Omit<Study, 'id' | 'createdAt'>, roles: RoleType[]): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    let newStudyId;
    try {
      dispatch(createStudySlice.actions.createStudyStart());
      const studyRes = await API.createStudy({
        name: s.name,
        info: {
          color: s.color,
        },
      });
      studyRes.checkError();
      await dispatch(updateTokens());
      await dispatch(fetchStudies({ force: true }));
      newStudyId = getState().studies.studies.find((ss) => ss.name === s.name)?.id;
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
      dispatch(createStudySlice.actions.createStudyError(String(err)));
      return;
    }

    try {
      const { authToken } = getState().auth;
      const accountId = decodeAuthToken(authToken || '')?.sub;
      if (!accountId) {
        throw new Error(`Cannot read user id from auth token`);
      }
      const res = await API.updateUserRole({
        accountId,
        roles: roleToApi({
          projectId: newStudyId,
          roles,
        }),
      });
      res.checkError();
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
  (studies, selectedStudyId) => studies.find((s) => s.id === selectedStudyId)
);

export const selectedStudyIdSelector = (state: RootState) => selectedStudySelector(state)?.id;
export const useSelectedStudyId = () => useAppSelector(selectedStudyIdSelector);

export default {
  [studiesSlice.name]: studiesSlice.reducer,
  [createStudySlice.name]: createStudySlice.reducer,
};
