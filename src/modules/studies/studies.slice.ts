import _first from 'lodash/first';
import _uniqueId from 'lodash/uniqueId';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SpecColorType } from 'src/styles/theme';
import { AppThunk, RootState, useAppSelector } from 'src/modules/store';
import API from 'src/modules/api';
import * as api from 'src/modules/api/models';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { updateTokens } from 'src/modules/auth/auth.slice';
import { mockStudies } from 'src/modules/studies/studies.slice.mock';

const SELECTED_STUDY_KEY = 'selected_study';

API.mock.provideEndpoints({
  getStudies() {
    return API.mock.response(mockStudies);
  },
  createStudy(req) {
    const s = { id: { value: _uniqueId('study') }, isOpen: true, ...req };
    mockStudies.push(s);
    return API.mock.response(undefined);
  },
});

export type Study = {
  id: string;
  name: string;
  color: SpecColorType;
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
      const studies = data
        // .filter((s) => s.isOpen) // TODO: uncomment once test data is in open project
        .map(transformStudyFromApi);

      dispatch(fetchStudiesFinished(studies));
    } catch (e) {
      dispatch(fetchStudiesFinished([]));

      if (!applyDefaultApiErrorHandlers(e, dispatch)) {
        dispatch(showSnackbar({ text: String(e) }));
      }
    }
  };

export const createStudy =
  (s: Omit<Study, 'id'>): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    await API.createStudy({
      name: s.name,
      info: {
        color: s.color,
      },
    });
    await dispatch(updateTokens());
    await dispatch(fetchStudies({ force: true }));
    const newStudyId = getState().studies.studies.find((ss) => ss.name === s.name)?.id;
    dispatch(setSelectedStudyId(newStudyId));
  };

export const selectStudy = setSelectedStudyId;

export const studiesSelector = (state: RootState) => state.studies.studies;

export const selectedStudySelector = createSelector(
  [
    (state: RootState) => state.studies.studies,
    (state: RootState) => state.studies.selectedStudyId,
  ],
  (studies, selectedStudyId) => studies.find((s) => s.id === selectedStudyId)
);

export const selectedStudyIdSelector = (state: RootState) => selectedStudySelector(state)?.id;

export const useSelectedStudyId = () => useAppSelector(selectedStudyIdSelector);

export default studiesSlice.reducer;
