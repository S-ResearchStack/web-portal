import { useCallback } from 'react';
import { createSlice } from '@reduxjs/toolkit';

import API from 'src/modules/api';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useTranslation } from 'src/modules/localization/useTranslation';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';

type DeleteEducationState = {
  isDeleting: boolean;
  isCanceling: boolean;
};

const deleteEducationInitialState: DeleteEducationState = {
  isDeleting: false,
  isCanceling: false,
};

export const deleteEducationSlice = createSlice({
  name: 'education/deleteEducation',
  initialState: deleteEducationInitialState,
  reducers: {
    deletingStarted: (state) => {
      state.isDeleting = true;
    },
    deletingFinished: (state) => {
      state.isDeleting = false;
    },
    cancelingStarted: (state) => {
      state.isCanceling = true;
    },
    cancelingFinished: (state) => {
      state.isCanceling = false;
    },
  },
});

const { deletingStarted, deletingFinished, cancelingStarted, cancelingFinished } =
  deleteEducationSlice.actions;

type EducationalContentParams = { 
  studyId: string;
  educationId: string;
};

const deleteEducation =
  ({ studyId, educationId }: EducationalContentParams): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const { t } = useTranslation();
    try {
      dispatch(deletingStarted());

      const response = await API.deleteEducation({ studyId, educationId });
      response.checkError();

      dispatch(showSnackbar({ text: t('CAPTION_DELETE_EUDCATION_SUCCESS') }));
    } catch (err) {
      dispatch(showSnackbar({ text: t('CAPTION_DELETE_EDUCATIONAL_CONTENT_FAILED') }));
    } finally {
      setTimeout(() => dispatch(deletingFinished()), 100);
    }
  };

const cancelEducation =
  (
    { studyId, educationId }: EducationalContentParams
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const { t } = useTranslation();
    try {
      dispatch(cancelingStarted());

      const response = await API.updateEducation({ studyId, educationId }, { status: 'DRAFT', publishedAt: undefined });
      response.checkError();

      dispatch(showSnackbar({ text: t('CAPTION_CANCEL_PUBLISH_EDUCATION_SUCCESS') }));
    } catch (err) {
      dispatch(showSnackbar({ text: t('CAPTION_CANCEL_PUBLISH_EDUCATION_FAILED') }));
    } finally {
      setTimeout(() => dispatch(cancelingFinished()), 100);
    }
  };

export const deleteEducationSelector = (state: RootState) =>
  state[deleteEducationSlice.name];

export const useDeleteEducation = () => {
  const dispatch = useAppDispatch();

  return {
    ...useAppSelector(deleteEducationSelector),
    deleteEducation: useCallback(
      (params: EducationalContentParams) => dispatch(deleteEducation(params)),
      [dispatch]
    ),
    cancelEducation: useCallback(
      (params: EducationalContentParams) =>
        dispatch(cancelEducation(params)),
      [dispatch]
    ),
  };
};

export default {
  [deleteEducationSlice.name]: deleteEducationSlice.reducer,
};
