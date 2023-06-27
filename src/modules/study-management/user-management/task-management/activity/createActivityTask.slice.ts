import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';
import { push } from 'connected-react-router';
import { createSlice } from '@reduxjs/toolkit';

import _uniqueId from 'lodash/uniqueId';

import {
  AppThunk,
  RootState,
  useAppDispatch,
  useAppSelector,
  WithSending,
} from 'src/modules/store';
import Api, { ActivityTask, ActivityTaskType } from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { Path } from 'src/modules/navigation/store';
import { activityItemListFromApi, emptySection } from './activity-editor/activityConversion';
import {
  clearActivityTransientState,
  saveActivityIfRequired,
  setActivityTask,
  updateLastTouched,
} from './activity-editor/activityEditor.slice';
import { activitiesListDataSelector, mockTasks } from './activitiesList.slice';
import { activityDescriptionByType, activityTypeToTitle } from './activities.utils';

Api.mock.provideEndpoints({
  createActivityTask() {
    const t: ActivityTask = {
      type: 'ACTIVITY',
      title: '',
      id: _uniqueId('task'),
      revisionId: 0,
      createdAt: new Date().toISOString(),
      startTime: new Date().toISOString(),
      status: 'DRAFT',
      validTime: 0,
      items: [],
    };
    mockTasks.push(t);
    return Api.mock.response(t);
  },
});

const initialState: WithSending = {};

const createActivityTaskSlice = createSlice({
  name: 'studyManagement/createActivity',
  initialState,
  reducers: {
    createActivityInit(state) {
      state.isSending = true;
      state.error = undefined;
    },
    createActivitySuccess(state) {
      state.isSending = false;
    },
    createActivityFailure(state) {
      state.isSending = false;
    },
  },
});

export const createActivitySelector = (state: RootState) => state[createActivityTaskSlice.name];

type CreateActivityTaskParams = {
  studyId: string;
  type: ActivityTaskType;
};

export const createActivityTask =
  ({ studyId, type }: CreateActivityTaskParams): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch(createActivityTaskSlice.actions.createActivityInit());
      const { data } = await Api.createActivityTask({ projectId: studyId, type });
      const {
        data: [task],
      } = await Api.getActivityTask({ projectId: studyId, id: data.id });

      const activityTask: ActivityTask = {
        ...task,
        items: [
          {
            type: 'ACTIVITY',
            name: 'Activity0',
            sequence: 0,
            contents: {
              required: true,
              type,
              completionTitle: '',
              completionDescription: '',
              properties: {
                transcription: '',
              },
            },
          },
        ],
      };

      const activities = activitiesListDataSelector(getState());
      const activityCount = activities
        ? Object.keys(activities)
            .map((k) => activities?.[k as keyof typeof activities] ?? [])
            .flat()
            .reduce((a, v) => a + (v.type === type ? 1 : 0), 0)
        : 0;

      dispatch(
        setActivityTask({
          studyId,
          type,
          id: data?.id,
          revisionId: data?.revisionId,
          title: `${activityTypeToTitle(type)} ${
            activityCount > 1 ? activityCount + 1 : ''
          }`.trim(),
          description: activityDescriptionByType(type),
          items: [
            emptySection({
              children: activityItemListFromApi(activityTask),
            }),
          ],
        })
      );
      dispatch(clearActivityTransientState());
      dispatch(updateLastTouched(Date.now()));
      await dispatch(saveActivityIfRequired({ force: true }));
      dispatch(push(generatePath(Path.StudyManagementEditActivity, { activityId: data?.id })));
      dispatch(createActivityTaskSlice.actions.createActivitySuccess());
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      dispatch(createActivityTaskSlice.actions.createActivityFailure());
    }
  };

export const useCreateActivityTask = () => {
  const dispatch = useAppDispatch();

  return {
    ...useAppSelector(createActivitySelector),
    create: useCallback(
      (params: CreateActivityTaskParams) => dispatch(createActivityTask(params)),
      [dispatch]
    ),
  };
};

export default {
  [createActivityTaskSlice.name]: createActivityTaskSlice.reducer,
};
