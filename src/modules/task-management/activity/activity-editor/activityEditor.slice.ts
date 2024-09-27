import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { Timestamp } from 'src/common/utils/datetime';
import { activityFromApi, ActivityTaskItem, ActivityItem } from './activityConversion';
import { activityDescriptionByType, activityTypeToTitle } from '../activities.utils';
import { ActivityTaskType, BaseTaskType, BaseTaskStatus } from 'src/modules/api';

type FieldError = { empty?: boolean };
export type ActivityItemErrors = {
  id: string;
  value: {
    transcription: FieldError;
    completionTitle: FieldError;
    completionDescription: FieldError;
  };
};

export type ActivityErrors = {
  title: FieldError;
  description: FieldError;
  items: ActivityItemErrors[];
};

export interface ActivitySection {
  id: string;
  children: ActivityItem[];
}

export type ActivityEditorState = {
  isLoading: boolean;
  lastTouchedOn?: number;
  data?: ActivityTaskItem;
  errors?: ActivityErrors;
  sections?: ActivitySection[];
};

export const initialState: ActivityEditorState = {
  isLoading: false,
};

export const activityEditorSlice = createSlice({
  name: 'task/activityEditor',
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    setActivityTask(state, action: PayloadAction<ActivityTaskItem | undefined>) {
      state.data = action.payload;
    },
    setActivityErrors(state, action: PayloadAction<ActivityErrors>) {
      state.errors = action.payload;
    },
    clearActivityTransientState(state) {
      state.lastTouchedOn = undefined;
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
  setActivityTask,
  setActivityErrors,
  clearActivityTransientState,
  updateLastTouched,
  setSections,
  updateSection,
  reset,
} = activityEditorSlice.actions;

const newActivity = (studyId: string, activityType: ActivityTaskType): ActivityTaskItem => {
  const activity = activityFromApi(studyId, {
    id: '',
    taskType: BaseTaskType.ACTIVITY,
    status: BaseTaskStatus.CREATED,
    title: activityTypeToTitle(activityType),
    description: activityDescriptionByType(activityType),
    createdAt: new Date(Date.now()).toISOString(),
    schedule: '* * * * * ? *',
    startTime: '',
    endTime: '',
    validMin: 0,
    duration: '',
    iconUrl: '',
    task: {
      type: activityType,
      completionTitle: '',
      completionDescription: '',
    },
  });
  return activity;
};
type GenerateParams = {
  studyId: string;
  activityType: ActivityTaskType;
};
export const generateActivity =
  ({
    studyId,
    activityType,
  }: GenerateParams): AppThunk<Promise<void>> =>
    async (dispatch) => {
      dispatch(loadingStarted());

      const activity = newActivity(studyId, activityType);
      dispatch(setActivityTask(activity));
      dispatch(clearActivityTransientState());

      dispatch(loadingFinished());
    };

export const getActivityErrors = ({
  item: s,
  currentErrors: cur,
}: {
  item: ActivityTaskItem;
  currentErrors?: ActivityErrors;
}): ActivityErrors => {
  const items = s.items.map((section) => section.children).flat();

  if (cur) {
    return {
      title: { empty: cur.title.empty && !s.title },
      description: { empty: cur.description.empty && !s.description },
      items: items.map((i) => {
        const item = cur.items.find((qq) => qq.id === i.id);
        const { completionTitle, completionDescription, transcription } = item?.value || {};

        return {
          id: i.id,
          value: {
            completionTitle: { empty: completionTitle?.empty && !i.value?.completionTitle },
            completionDescription: { empty: completionDescription?.empty && !i.value?.completionDescription },
            transcription: { empty: transcription?.empty && !i.value?.transcription },
          },
        };
      }),
    };
  }

  return {
    title: { empty: s.title.length === 0 },
    description: { empty: s.description.length === 0 },
    items: items.map((q) => {
      const { completionTitle, completionDescription, transcription } = q.value || {};

      return {
        id: q.id,
        value: {
          completionTitle: {
            empty: completionTitle?.length === 0,
          },
          completionDescription: {
            empty: completionDescription?.length === 0,
          },
          transcription: {
            empty: transcription?.length === 0,
          },
        },
      };
    }),
  };
};

const hasActivityTitleErrors = (ae: ActivityErrors) => !!ae.title.empty;
export const hasActivityDescriptionErrors = (ae: ActivityErrors) => !!ae.description.empty;
export const hasActivityItemsErrors = (ae: ActivityItemErrors) => Object.values(ae.value).some(({ empty }) => empty);
export const hasSomeActivityErrors = (ae: ActivityErrors) =>
  ae.items.some(hasActivityItemsErrors) || hasActivityTitleErrors(ae) || hasActivityDescriptionErrors(ae);

// TODO: should assume empty activity somehow else
export const editedActivitySelector = (state: RootState) =>
  state[activityEditorSlice.name].data || {
    studyId: '',
    id: '',
    type: '' as ActivityTaskType,
    title: '',
    description: '',
    items: [],
  };

const activitySectionsSelector = (state: RootState) => state[activityEditorSlice.name].data?.items;
const activityEditorActivityErrorsSelector = (state: RootState) => state[activityEditorSlice.name].errors;
export const activityEditorIsLoadingSelector = (state: RootState) => state[activityEditorSlice.name].isLoading;

export const updateActivity =
  (activity: ActivityTaskItem): AppThunk =>
    (dispatch, getState) => {
      const activityErrors = activityEditorActivityErrorsSelector(getState());

      dispatch(setActivityTask(activity));
      dispatch(updateLastTouched());
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

export const useActivityEditor = () => {
  const dispatch = useAppDispatch();
  const activity = useAppSelector(editedActivitySelector);
  const isLoading = useAppSelector(activityEditorIsLoadingSelector);
  const activityErrors = useAppSelector(activityEditorActivityErrorsSelector);
  const lastTouchedOn = useAppSelector((state: RootState) => state[activityEditorSlice.name].lastTouchedOn);

  const generate = useCallback((params: GenerateParams) => {
    dispatch(generateActivity(params));
  },
    [dispatch]
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

  const updateActivityItem = useCallback(
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

  const resetAll = useCallback(() => dispatch(reset()), [dispatch]);

  return {
    isLoading,
    activity,
    activityErrors,
    lastTouchedOn,
    generateActivity: generate,
    setActivity: set,
    updateActivity: setPartial,
    updateActivityItem,
    validateActivity,
    reset: resetAll,
  };
};

export default {
  [activityEditorSlice.name]: activityEditorSlice.reducer,
};
