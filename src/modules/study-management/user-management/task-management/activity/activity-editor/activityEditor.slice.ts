import { useCallback } from 'react';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import API, { ActivityTask, ActivityTaskType } from 'src/modules/api';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import { Timestamp } from 'src/common/utils/datetime';
import {
  pushDraftItem,
  sortTaskList,
  updateDraftItem,
} from 'src/modules/study-management/user-management/common/utils';
import {
  activitiesListDataSelector,
  activitiesListSlice,
  transformActivitiesListItemFromApi,
} from '../activitiesList.slice';
import {
  activityFromApi,
  ActivityTaskItem,
  transformActivityListItemToActivityItem,
  ActivityItem,
  activityUpdateToApi,
} from './activityConversion';

type FieldError = { empty?: boolean };
export type ActivityItemErrors = {
  id: string;
  value: {
    transcription: FieldError;
    completionTitle: FieldError;
  };
};

export type ActivityErrors = {
  description: FieldError;
  items: ActivityItemErrors[];
};

export interface ActivitySection {
  id: string;
  children: ActivityItem[];
}

export type ActivityEditorState = {
  isSaving: boolean;
  isLoading: boolean;
  lastTouchedOn?: number;
  savedOn?: number;
  errors?: ActivityErrors;
  isFailedConnection?: boolean;
  sections?: ActivitySection[];
  data?: ActivityTaskItem;
};

export const initialState: ActivityEditorState = {
  isSaving: false,
  isLoading: false,
};

export const activityEditorSlice = createSlice({
  name: 'studyManagement/activityEditor',
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    savingStarted: (state) => {
      state.isSaving = true;
    },
    savingFinished: (
      state,
      action: PayloadAction<{ error?: boolean; isFailedConnection?: boolean }>
    ) => {
      state.isSaving = false;
      if (!action.payload.error) {
        state.savedOn = Date.now();
      }
      state.isFailedConnection = !!action.payload.isFailedConnection;
    },
    setActivityTask(state, action: PayloadAction<ActivityTaskItem | undefined>) {
      state.data = action.payload;
    },
    setActivityErrors(state, action: PayloadAction<ActivityErrors>) {
      state.errors = action.payload;
    },
    clearActivityTransientState(state) {
      state.lastTouchedOn = undefined;
      state.savedOn = undefined;
      state.errors = undefined;
    },
    updateLastTouched(state, action: PayloadAction<Timestamp | undefined>) {
      state.lastTouchedOn = action.payload ?? Date.now();
    },
    setSections(state, action: PayloadAction<ActivitySection[]>) {
      state.sections = action.payload;
    },
    updateSection(
      state,
      action: PayloadAction<Partial<Omit<ActivitySection, 'id'>> & Pick<ActivitySection, 'id'>>
    ) {
      if (!state.sections) {
        return;
      }

      state.sections = state.sections.map((s) =>
        s.id === action.payload.id ? { ...s, ...action.payload } : s
      );
    },
    reset() {
      return { ...initialState };
    },
  },
});

export const {
  loadingStarted,
  loadingFinished,
  savingStarted,
  savingFinished,
  setActivityTask,
  setActivityErrors,
  clearActivityTransientState,
  updateLastTouched,
  setSections,
  updateSection,
  reset,
} = activityEditorSlice.actions;

export const loadActivity =
  ({
    studyId,
    activityId,
    onError,
  }: {
    studyId: string;
    activityId: string;
    onError: () => void;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(loadingStarted());
      const { data } = await API.getActivityTask({ projectId: studyId, id: activityId });
      const [task] = data;
      const activityTask = activityFromApi(studyId, task);
      dispatch(setActivityTask(activityTask));
      dispatch(clearActivityTransientState());
    } catch (err) {
      onError();
    } finally {
      dispatch(loadingFinished());
    }
  };

export const getActivityErrors = ({
  item: s,
  currentErrors: cur,
}: {
  item: ActivityTaskItem;
  currentErrors?: ActivityErrors;
}): ActivityErrors => {
  const items = s.items.map((section) => section.children).flat();

  // only clear existing errors
  if (cur) {
    return {
      description: { empty: cur.description.empty && !s.description },
      items: items.map((i) => {
        const item = cur.items.find((qq) => qq.id === i.id);
        const { completionTitle, transcription } = item?.value || {};

        return {
          id: i.id,
          value: {
            completionTitle: { empty: completionTitle?.empty && !i.value?.completionTitle },
            transcription: { empty: transcription?.empty && !i.value?.transcription },
          },
        };
      }),
    };
  }

  return {
    description: { empty: s.description.length === 0 },
    items: items.map((q) => {
      const { completionTitle, transcription } = q.value || {};

      return {
        id: q.id,
        value: {
          completionTitle: {
            empty: completionTitle?.length === 0,
          },
          transcription: {
            empty: transcription?.length === 0,
          },
        },
      };
    }),
  };
};

export const hasActivityItemsErrors = (ae: ActivityItemErrors) =>
  Object.values(ae.value).some(({ empty }) => empty);
export const hasActivityDescriptionErrors = (ae: ActivityErrors) => !!ae.description.empty;
export const hasSomeActivityErrors = (ae: ActivityErrors) =>
  ae.items.some(hasActivityItemsErrors) || hasActivityDescriptionErrors(ae);

// TODO: should assume empty activity somehow else
export const editedActivitySelector = (state: RootState) =>
  state[activityEditorSlice.name].data || {
    studyId: '',
    id: '',
    revisionId: 0,
    type: '' as ActivityTaskType,
    title: '',
    description: '',
    items: [],
  };

const activityEditorActivityErrorsSelector = (state: RootState) =>
  state[activityEditorSlice.name].errors;

export const openActivityResults =
  ({ activityId }: { activityId: string }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const activityList = activitiesListDataSelector(getState());
    const preloadedActivityItem = activityList?.published.find((t) => t.id === activityId);
    const activityItem =
      preloadedActivityItem && transformActivityListItemToActivityItem(preloadedActivityItem);

    dispatch(setActivityTask(activityItem));
    dispatch(push(generatePath(Path.StudyManagementActivityResults, { activityId })));
  };

export const editActivity =
  ({ activityId }: { studyId: string; activityId: string }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      const activityList = activitiesListDataSelector(getState());
      const preloadedActivityItem = activityList?.drafts.find((t) => t.id === activityId);
      const activityItem =
        preloadedActivityItem && transformActivityListItemToActivityItem(preloadedActivityItem);

      dispatch(setActivityTask(activityItem));
      dispatch(clearActivityTransientState());
      dispatch(push(generatePath(Path.StudyManagementEditActivity, { activityId })));
    } catch (err) {
      // TODO: what to show?
      console.error(err);
    }
  };

export const AUTOSAVE_DEBOUNCE_INTERVAL = 100;

type SaveActivityParams = { force?: boolean };

let lastParallelSaveParams: SaveActivityParams | undefined;

export const saveActivityIfRequired =
  (params: SaveActivityParams): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { isSaving, lastTouchedOn, data } = getState()[activityEditorSlice.name];

    if (!data || !lastTouchedOn) {
      return;
    }

    if (isSaving) {
      if (!lastParallelSaveParams?.force) {
        lastParallelSaveParams = params;
      }
      return;
    }

    if (
      !lastParallelSaveParams &&
      !params.force &&
      Date.now() - lastTouchedOn <= AUTOSAVE_DEBOUNCE_INTERVAL
    ) {
      return;
    }

    try {
      dispatch(savingStarted());

      const [apiTask] = (await API.getActivityTask({ projectId: data.studyId, id: data.id })).data;
      const task = { ...apiTask, ...activityUpdateToApi(data) };
      const res = await API.updateActivityTask(
        { projectId: data.studyId, id: data.id, revisionId: data.revisionId },
        task
      );
      res.checkError();

      const list = activitiesListDataSelector(getState());

      if (list) {
        const hasItem = list.drafts.findIndex((i) => i.id === task.id) > -1;
        const categories = sortTaskList(
          (hasItem ? updateDraftItem : pushDraftItem)(
            transformActivitiesListItemFromApi({
              task: task as ActivityTask,
              totalParticipants: 0,
              respondedParticipants: 0,
            }),
            list,
            (i) => ({
              ...i,
              modifiedAt: Date.now(),
            })
          )
        );
        dispatch(activitiesListSlice.actions.setData({ data: categories }));
      }

      dispatch(savingFinished({ error: false }));
    } catch (err) {
      console.error(err);
      dispatch(savingFinished({ error: true, isFailedConnection: true }));
    } finally {
      if (lastParallelSaveParams) {
        const p = lastParallelSaveParams;
        lastParallelSaveParams = undefined;
        await dispatch(saveActivityIfRequired(p));
      }
    }
  };

let autoSaveTimeoutId = 0;

export const autoSaveIfRequired = (): AppThunk => (dispatch) => {
  if (autoSaveTimeoutId) {
    clearTimeout(autoSaveTimeoutId);
  }
  autoSaveTimeoutId = window.setTimeout(async () => {
    await dispatch(saveActivityIfRequired({ force: false }));
  }, AUTOSAVE_DEBOUNCE_INTERVAL);
};

export const updateActivity =
  (activity: ActivityTaskItem): AppThunk =>
  (dispatch, getState) => {
    const activityErrors = activityEditorActivityErrorsSelector(getState());

    dispatch(setActivityTask(activity));
    dispatch(updateLastTouched());
    dispatch(autoSaveIfRequired());
    activityErrors &&
      dispatch(
        setActivityErrors(
          getActivityErrors({
            item: activity,
            currentErrors: activityErrors,
          })
        )
      );
  };

const updateSections =
  (s: ActivitySection[]): AppThunk =>
  (dispatch, getState) => {
    const activity = editedActivitySelector(getState());
    dispatch(setSections(s));
    dispatch(updateActivity(activity));
  };

const activitySectionsSelector = (state: RootState) => state[activityEditorSlice.name].data?.items;

export const useActivitySections = () => {
  const sections = useAppSelector(activitySectionsSelector);
  const dispatch = useAppDispatch();

  const set = useCallback((s: ActivitySection[]) => dispatch(updateSections(s)), [dispatch]);
  const update = useCallback(
    (section: Partial<Omit<ActivitySection, 'id'>> & Pick<ActivitySection, 'id'>) =>
      dispatch(updateSection(section)),
    [dispatch]
  );
  return {
    sections,
    setSections: set,
    updateSection: update,
  };
};

export const activityEditorIsLoadingSelector = (state: RootState) =>
  state[activityEditorSlice.name].isLoading;
export const activityEditorIsSavingSelector = (state: RootState) =>
  state[activityEditorSlice.name].isSaving;
export const activityEditorIsFailedConnectionSelector = (state: RootState) =>
  state[activityEditorSlice.name].isFailedConnection;
export const activityEditorLastTouchedSelector = (state: RootState) =>
  state[activityEditorSlice.name].lastTouchedOn;
export const activitySavedOnSelector = (state: RootState) =>
  state[activityEditorSlice.name].savedOn;

export const useActivityEditor = () => {
  const activity = useAppSelector(editedActivitySelector);
  const isLoading = useAppSelector(activityEditorIsLoadingSelector);
  const isSaving = useAppSelector(activityEditorIsSavingSelector);
  const activityErrors = useAppSelector(activityEditorActivityErrorsSelector);
  const savedOn = useAppSelector(activitySavedOnSelector);
  const isFailedConnection = useAppSelector(activityEditorIsFailedConnectionSelector);
  const lastTouchedOn = useAppSelector(activityEditorLastTouchedSelector);
  const dispatch = useAppDispatch();

  const load = useCallback(
    ({
      studyId,
      activityId,
      onError,
    }: {
      studyId: string;
      activityId: string;
      onError: () => void;
    }) => {
      if (!isLoading && studyId !== activity?.studyId && activityId !== activity?.id) {
        dispatch(loadActivity({ studyId, activityId, onError }));
      }
    },
    [dispatch, isLoading, activity?.id, activity?.studyId]
  );

  const set = useCallback(
    (a: ActivityTaskItem) => {
      dispatch(updateActivity(a));
    },
    [dispatch]
  );

  const setPartial = useCallback(
    (a: Partial<ActivityTaskItem>) => {
      set({ ...activity, ...a });
    },
    [activity, set]
  );

  const updateQuestion = useCallback(
    (item: Partial<ActivityItem>) => {
      set({
        ...activity,
        items: activity.items.map((s) => ({
          ...s,
          children: s.children.map((q) =>
            q.id === item.id ? ({ ...q, ...item } as ActivityItem) : ({ ...q } as ActivityItem)
          ),
        })),
      });
    },
    [activity, set]
  );

  const validateActivity = useCallback(() => {
    const se = getActivityErrors({
      item: activity,
    });
    dispatch(setActivityErrors(se));
    return se;
  }, [activity, dispatch]);

  const saveActivity = useCallback(async () => {
    await dispatch(saveActivityIfRequired({ force: true }));
  }, [dispatch]);

  const resetAll = useCallback(() => dispatch(reset()), [dispatch]);

  return {
    activity,
    activityErrors,
    loadActivity: load,
    setActivity: set,
    isLoading,
    savedOn,
    updateActivity: setPartial,
    updateQuestion,
    validateActivity,
    saveActivity,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
    reset: resetAll,
  };
};

export default {
  [activityEditorSlice.name]: activityEditorSlice.reducer,
};
