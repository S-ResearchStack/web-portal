import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { replace } from 'connected-react-router';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import API, { EducationalCreateRequest, EducationalUpdateRequest, EducationalContentStatus } from 'src/modules/api';
import { Path } from 'src/modules/navigation/store';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithSending } from 'src/modules/store';
import { editedEducationSelector, transformEducationToApi, uploadAttachmentIfNeeded } from './educationEditor.slice';

type PublishEducationState = WithSending;

const publishEducationInitialState: PublishEducationState = {
  isSending: false,
  error: undefined,
};

export const publishEducationSlice = createSlice({
  name: 'education/publishEducation',
  initialState: publishEducationInitialState,
  reducers: {
    sendingStarted: (state) => {
      state.isSending = true;
    },
    sendingSuccess: (state) => {
      state.isSending = false;
      state.error = undefined;
    },
    sendingFailure: (state, action: PayloadAction<ErrorType>) => {
      state.isSending = false;
      state.error = action.payload;
    },
  },
});

export const publishEducationSelector = (state: RootState): PublishEducationState =>
  state[publishEducationSlice.name];

const publishEducation = (publishedAt: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const data = editedEducationSelector(getState());

    if (!data || !data.studyId) {
      return;
    }

    try {
      dispatch(publishEducationSlice.actions.sendingStarted());

      let educationId = data.id, educationPublish;
      const education = await uploadAttachmentIfNeeded(data);

      if (!educationId) {
        const educationCreate = transformEducationToApi(education) as EducationalCreateRequest;
        const resCreate = await API.createEducation({ studyId: data.studyId }, educationCreate);
        resCreate.checkError();

        educationId = resCreate.data.id;
        educationPublish = {
          status: 'PUBLISHED' as EducationalContentStatus,
          publishedAt,
        } as EducationalUpdateRequest;
      } else {
        educationPublish = {
          ...transformEducationToApi(education),
          status: 'PUBLISHED' as EducationalContentStatus,
          publishedAt,
        } as EducationalUpdateRequest;
      };

      const resPublish = await API.updateEducation({ studyId: data.studyId, educationId }, educationPublish);
      resPublish.checkError();

      dispatch(replace(generatePath(Path.EducationalManagement)));
      dispatch(publishEducationSlice.actions.sendingSuccess());
    } catch (e) {
      dispatch(publishEducationSlice.actions.sendingFailure(String(e)));
    }
  };

export const usePublishEducationSlice = () => {
  const dispatch = useAppDispatch();
  const sliceState = useSelector(publishEducationSelector);
  const publish = useCallback(
    (publishedAt: string) => dispatch(publishEducation(publishedAt)),
    [dispatch]
  );

  return {
    ...sliceState,
    publish,
  };
};

export default {
  [publishEducationSlice.name]: publishEducationSlice.reducer,
};
