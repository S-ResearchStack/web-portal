import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { replace } from 'connected-react-router';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import API from 'src/modules/api';
import { Path } from 'src/modules/navigation/store';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithSending } from 'src/modules/store';
import { PublicationStatus } from 'src/modules/api/models/education';
import {
  moveListItemToPublish,
  sortTaskList,
} from 'src/modules/study-management/user-management/common/utils';
import {
  educationListDataSelector,
  educationListSlice,
  PublicationListItem,
} from '../educationList.slice';
import { editedPublicationSelector, publicationFromApi } from './educationEditor.slice';

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

const publishEducation =
  (publishedAt: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const editedPublication = editedPublicationSelector(getState());
    if (!editedPublication?.id) {
      return;
    }

    try {
      dispatch(publishEducationSlice.actions.sendingStarted());

      const { studyId: projectId, id, revisionId } = editedPublication;
      const [apiPublication] = (await API.getEducationPublication({ projectId, id })).data;

      const publicationUpdate = {
        ...apiPublication,
        status: 'PUBLISHED' as PublicationStatus,
        publishedAt,
      };

      const res = await API.updateEducationPublication(
        { projectId, id, revisionId },
        publicationUpdate
      );
      res.checkError();

      const list = educationListDataSelector(getState());
      if (list) {
        const categories = sortTaskList(
          moveListItemToPublish(
            publicationFromApi('', apiPublication) as PublicationListItem,
            list,
            (i) => ({
              ...i,
              publishedAt: Date.now(),
              modifiedAt: Date.now(),
              status: 'PUBLISHED',
            })
          )
        );

        dispatch(educationListSlice.actions.setData({ data: categories }));
      }

      dispatch(educationListSlice.actions.refetch());
      dispatch(replace(generatePath(Path.StudyManagement)));
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
