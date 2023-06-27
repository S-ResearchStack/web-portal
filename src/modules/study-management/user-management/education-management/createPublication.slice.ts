import { useCallback } from 'react';
import { createSlice } from '@reduxjs/toolkit';

import API, { CreatePublicationSliceFetchArgs, Publication } from 'src/modules/api';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { newId } from './education-editor/utils';
import {
  clearTransientState,
  editEducationPublication,
  emptySection,
  savePublicationIfRequired,
  setPublication,
  updateLastTouched,
} from './education-editor/educationEditor.slice';
import { makePublicationsItem, mockPublications } from './educationList.slice';

API.mock.provideEndpoints({
  createPublication({ source }) {
    const publication: Publication = {
      educationContent: [makePublicationsItem('TEXT', Math.random())],
      revisionId: 0,
      status: 'DRAFT',
      id: newId(),
      source,
      title: '',
      category: '',
      modifiedAt: new Date().toISOString(),
    };
    mockPublications.push(publication);
    return API.mock.response(publication);
  },
});

export type SurveyQuestionErrors = {
  id: string;
  title: { empty?: boolean };
};

export type SurveyErrors = {
  title: { empty?: boolean };
  questions: SurveyQuestionErrors[];
};

export const hasSurveyTitleErrors = (se: SurveyErrors) => !!se.title.empty;

export const hasSurveyQuestionErrors = (qe: SurveyQuestionErrors) => !!qe.title.empty;

export const hasSomeSurveyErrors = (se: SurveyErrors) =>
  hasSurveyTitleErrors(se) || se.questions.some(hasSurveyQuestionErrors);

type CreateEducationState = {
  isCreating: boolean;
};

const createEducationInitialState: CreateEducationState = {
  isCreating: false,
};

export const createPublicationSlice = createSlice({
  name: 'education/createPublication',
  initialState: createEducationInitialState,
  reducers: {
    creatingStarted: (state) => {
      state.isCreating = true;
    },
    creatingFinished: (state) => {
      state.isCreating = false;
    },
  },
});

const { creatingStarted, creatingFinished } = createPublicationSlice.actions;

const CREATE_PUBLICATION_FAILED_MESSAGE = 'Failed to create publication.';

const createNewPublication =
  ({ projectId, source }: CreatePublicationSliceFetchArgs): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(creatingStarted());

      const { data } = await API.createPublication({ projectId, source });
      dispatch(
        setPublication({
          studyId: projectId,
          status: 'DRAFT',
          source,
          revisionId: data.revisionId,
          id: data.id,
          title: 'Publication Title',
          educationContent: [
            emptySection({
              children: [makePublicationsItem('TEXT', 0)],
            }),
          ],
        })
      );

      dispatch(clearTransientState());
      dispatch(updateLastTouched());
      await dispatch(savePublicationIfRequired({ force: true }));
      dispatch(editEducationPublication({ educationId: data.id }));
    } catch (err) {
      console.error(err);
      // TODO: what to show?
      dispatch(showSnackbar({ text: CREATE_PUBLICATION_FAILED_MESSAGE }));
    } finally {
      // TODO delete when create publication will be added
      setTimeout(() => dispatch(creatingFinished()), 100);
    }
  };

export const createEducationSelector = (state: RootState) => state[createPublicationSlice.name];

export const useCreatePublication = () => {
  const dispatch = useAppDispatch();

  return {
    ...useAppSelector(createEducationSelector),
    create: useCallback(
      (params: CreatePublicationSliceFetchArgs) => dispatch(createNewPublication(params)),
      [dispatch]
    ),
  };
};

export default {
  [createPublicationSlice.name]: createPublicationSlice.reducer,
};
