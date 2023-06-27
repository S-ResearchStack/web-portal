import { useCallback, useEffect } from 'react';
import { generatePath } from 'react-router-dom';
import usePrevious from 'react-use/lib/usePrevious';
import { push } from 'connected-react-router';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import _uniqueId from 'lodash/uniqueId';
import _isUndefined from 'lodash/isUndefined';
import _isNil from 'lodash/isNil';
import _isEqual from 'lodash/isEqual';
import _trim from 'lodash/trim';

import useShowSnackbar from 'src/modules/snackbar/useShowSnackbar';
import API, {
  ChoiceQuestion,
  ChoiceQuestionSkipLogic,
  TaskItemQuestion,
  TaskItemType,
  TaskUpdate,
} from 'src/modules/api';
import { Task, TaskItem } from 'src/modules/api/models/tasks';
import { Path } from 'src/modules/navigation/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { Timestamp } from 'src/common/utils/datetime';
import {
  pushDraftItem,
  sortTaskList,
  updateDraftItem,
} from 'src/modules/study-management/user-management/common/utils';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import type { SingleSelectionQuestionItem } from './questions/single-selection';
import {
  mockTasks,
  surveyListDataSelector,
  SurveyListItem,
  surveyListSlice,
  transformSurveyListItemFromApi,
} from '../surveyList.slice';
import {
  DateTimeAnswer,
  DateTimeQuestionItem,
  getQuestionHandler,
  ImagesAnswer,
  ImageSelectionQuestionItem,
  QuestionAnswer,
  questionHandlers,
  QuestionItem,
  QuestionOptionKey,
  QuestionType,
  ScalableAnswer,
  SelectableAnswer,
} from './questions';
import { emptySkipLogicCondition, removeInvalidSkipLogic } from './skip-logic/helpers';
import type { SkipLogicDestinationTargetType, SkipLogicRule } from './skip-logic/types';
import { transformConditionsToApi, transformConditionsFromApi } from './skip-logic/api';
import { QuestionItemSkipLogic } from './skip-logic/types';

export type {
  QuestionItem,
  QuestionType,
  ScalableAnswer,
  SelectableAnswer,
  ImageSelectionQuestionItem,
  ImagesAnswer,
  QuestionAnswer,
  QuestionOptionKey,
  DateTimeQuestionItem,
  DateTimeAnswer,
};

const SURVEY_TITLE_DEFAULT = 'Survey Title';

API.mock.provideEndpoints({
  createTask() {
    const t: Task = {
      id: _uniqueId('task'),
      revisionId: 0,
      createdAt: new Date().toISOString(),
      schedule: '',
      startTime: new Date().toISOString(),
      validTime: 0,
      status: 'DRAFT',
      items: [],
    };
    mockTasks.push(t);
    return API.mock.response(t);
  },
  updateTask({ id }, task) {
    const idx = mockTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      mockTasks[idx] = {
        ...mockTasks[idx],
        ...(task.status === 'PUBLISHED'
          ? { ...task, publishedAt: new Date().toISOString() }
          : task),
      } as Task;
    }
    return API.mock.response(undefined);
  },
});

export const newId = (): string => _uniqueId('survey');

export const MIN_SURVEY_SECTIONS = 2;

export interface SurveySection {
  id: string;
  title?: string;
  children: QuestionItem[];
}

const emptySection = (s?: Partial<SurveySection>): SurveySection => ({
  id: newId(),
  children: [],
  ...s,
});

export interface SurveyItem {
  studyId: string;
  id: string;
  revisionId: number;
  title: string;
  description: string;
  questions: SurveySection[];
}

export type SurveyQuestionErrors = {
  id: string;
  title: { empty?: boolean };
};

export type SurveyErrors = {
  title: { empty?: boolean };
  questions: SurveyQuestionErrors[];
};

export const emptyQuestion = (q?: Partial<SingleSelectionQuestionItem>) => ({
  ...questionHandlers.single.createEmpty(),
  ...q,
});

type SurveyInputEntriesIndexes = Record<number, [TaskItemType, string]>;

export const surveyQuestionFromApi = (
  ti: TaskItem,
  indexes: SurveyInputEntriesIndexes
): QuestionItem | undefined => {
  if (ti.type !== 'QUESTION') {
    return undefined;
  }

  const q = ti.contents as TaskItemQuestion;

  switch (q.type) {
    case 'CHOICE': {
      const props = q.properties as ChoiceQuestion;

      let response: QuestionItem;
      if (props.tag === 'CHECKBOX') {
        response = questionHandlers.multiple.fromApi(ti) as QuestionItem;
      } else if (props.tag === 'RADIO') {
        response = questionHandlers.single.fromApi(ti) as QuestionItem;
      } else if (props.tag === 'DROPDOWN') {
        response = questionHandlers.dropdown.fromApi(ti) as QuestionItem;
      } else {
        response = questionHandlers.images.fromApi(ti) as QuestionItem;
      }

      const transformSkipLogic = (
        skipLogicItem: ChoiceQuestionSkipLogic,
        values: SelectableAnswer[]
      ): SkipLogicRule | undefined => {
        try {
          const { goToItemSequence } = skipLogicItem;
          let conditions = transformConditionsFromApi(
            response.type,
            skipLogicItem.condition,
            values
          );
          if (!conditions.length) {
            conditions = [emptySkipLogicCondition(response.type === 'multiple')];
          }

          const hasGoToItemId = !_isNil(goToItemSequence);
          const targetType =
            hasGoToItemId && indexes[goToItemSequence]
              ? (indexes[goToItemSequence][0].toLowerCase() as SkipLogicDestinationTargetType)
              : undefined;

          let targetId: string | undefined;
          if (hasGoToItemId && indexes[goToItemSequence]) {
            [, targetId] = indexes[goToItemSequence];
          }

          return conditions || hasGoToItemId
            ? {
                id: newId(),
                conditions: conditions ?? [],
                destination: { targetType, targetId },
              }
            : undefined;
        } catch (e) {
          console.error(e);
          return undefined;
        }
      };

      return {
        ...response,
        skipLogic: props.skip_logic?.length
          ? {
              rules: props.skip_logic
                .map((c) => transformSkipLogic(c, response.answers as SelectableAnswer[]))
                .filter(Boolean),
            }
          : undefined,
      } as QuestionItem;
    }
    case 'SCALE':
      return questionHandlers.slider.fromApi(ti) as QuestionItem;
    case 'DATETIME':
      return questionHandlers['date-time'].fromApi(ti) as QuestionItem;
    case 'RANK':
      return questionHandlers.rank.fromApi(ti) as QuestionItem;
    case 'TEXT':
      return questionHandlers['open-ended'].fromApi(ti) as QuestionItem;
    default:
      console.warn(`Cannot convert from api - uahandled task item: ${JSON.stringify(ti)}`);
  }
  return undefined;
};

export const surveyQuestionListFromApi = (ti: TaskItem[]): SurveySection[] => {
  if (!ti.length) {
    return [emptySection()];
  }

  const result: SurveySection[] = [];
  const sortedTaskItem = [...ti]
    .filter((i) => ['QUESTION', 'SECTION'].includes(i?.type))
    .sort((a, b) => a.sequence - b.sequence);
  const hasSections = sortedTaskItem[0].type === 'SECTION';

  const indexes: SurveyInputEntriesIndexes = {};
  sortedTaskItem.forEach((i) => {
    if (i) {
      indexes[i.sequence] = [i.type, i.name];
    }
  });

  if (!hasSections) {
    result.push(
      emptySection({
        title: '',
        children: sortedTaskItem
          .map((i) => surveyQuestionFromApi(i, indexes))
          .filter(Boolean) as QuestionItem[],
      })
    );
  } else {
    for (let i = 0, currentSectionIdx = 0; i < sortedTaskItem.length; i += 1) {
      const item = sortedTaskItem[i];

      if (item.type === 'SECTION') {
        currentSectionIdx =
          result.push({
            id: item.name,
            title: item.contents.title ?? '',
            children: [],
          }) - 1;
      }

      if (item.type === 'QUESTION') {
        const question = surveyQuestionFromApi(item, indexes);
        if (question) {
          result[currentSectionIdx].children.push(question);
        }
      }
    }
  }

  return result;
};

export const surveyFromApi = (studyId: string, t: Task): SurveyItem => ({
  studyId,
  id: t.id,
  revisionId: t.revisionId,
  title: t.title || '',
  description: t.description || '',
  questions: surveyQuestionListFromApi(t.items),
});

export const surveyUpdateToApi = (s: SurveyItem): TaskUpdate => {
  const items: TaskItem[] = [];
  const hasOnlyVirtualSection = s.questions.length === 1;

  let sequence = 0;
  const indexes: Record<string, number> = {};
  const answers: Record<string, SelectableAnswer[]> = {};
  const logic: Record<string, QuestionItemSkipLogic> = {};
  const internalType: Record<string, QuestionType> = {};

  s.questions.forEach((section) => {
    if (!hasOnlyVirtualSection) {
      items.push({
        name: section.id,
        type: 'SECTION',
        sequence,
        contents: {
          title: section.title ?? '',
        },
      });

      indexes[section.id] = sequence;
      sequence += 1;
    }

    section.children.forEach((q) => {
      const qh = getQuestionHandler(q.type);
      if (!qh) {
        console.warn(`Cannot convert to api - handled survey question ${q}`);
      }

      const item = qh?.toApi(q);
      if (item) {
        indexes[q.id] = sequence;
        if ('type' in item.contents && item.contents.type === 'CHOICE') {
          if (q.answers) {
            answers[q.id] = q.answers as SelectableAnswer[];
          }
          if (q.skipLogic) {
            logic[q.id] = q.skipLogic;
          }
        }
        internalType[q.id] = q.type;

        items.push({
          ...item,
          sequence,
          name: q.id,
          contents: {
            ...item.contents,
            properties: {
              ...(item.contents as TaskItemQuestion).properties,
            },
          } as TaskItemQuestion,
        });
      }

      sequence += 1;
    });
  });

  const result: TaskItem[] = [];

  items.forEach((item) => {
    const skipLogic = logic[item.name]?.rules.map((r) => {
      let goToItemSequence = -1;

      if (r.destination.targetId) {
        goToItemSequence = items.find((i) => i.name === r.destination.targetId)?.sequence ?? -1;
      }

      return {
        condition: transformConditionsToApi(
          internalType[item.name],
          r.conditions,
          item.sequence,
          answers[item.name]
        ),
        goToItemSequence,
      };
    });

    result.push({
      ...item,
      contents: {
        ...item.contents,
        properties: {
          ...(item.contents as TaskItemQuestion).properties,
          ...('type' in item.contents && item.contents.type === 'CHOICE' && skipLogic
            ? { skip_logic: skipLogic }
            : {}),
        },
      },
    });
  });

  return {
    // TODO: currently API returns 400 error if title is empty (or contains only whitespace). To avoid that we're putting default placeholder.
    title: _trim(s.title) ? s.title : SURVEY_TITLE_DEFAULT,
    description: s.description,
    items: result,
  };
};

export const getSurveyErrors = ({
  survey: s,
  currentErrors: cur,
}: {
  survey: SurveyItem;
  currentErrors?: SurveyErrors;
}): SurveyErrors => {
  const questions = s.questions.map((section) => section.children).flat();

  // only clear existing errors
  if (cur) {
    return {
      title: {
        empty: cur.title.empty && !s.title,
      },
      questions: questions.map((q) => ({
        id: q.id,
        title: {
          empty: cur.questions.find((qq) => qq.id === q.id)?.title.empty && !q.title,
        },
      })),
    };
  }

  return {
    title: {
      empty: !s.title,
    },
    questions: questions.map((q) => ({
      id: q.id,
      title: {
        empty: !q.title,
      },
    })),
  };
};

export const hasSurveyTitleErrors = (se: SurveyErrors) => !!se.title.empty;

export const hasSurveyQuestionErrors = (qe: SurveyQuestionErrors) => !!qe.title.empty;

export const hasSomeSurveyErrors = (se: SurveyErrors) =>
  hasSurveyTitleErrors(se) || se.questions.some(hasSurveyQuestionErrors);

export type SurveyEditorState = {
  isSaving: boolean;
  isLoading: boolean;
  isCreating: boolean;
  lastTouchedOn?: number;
  savedOn?: number;
  survey?: SurveyItem;
  surveyErrors?: SurveyErrors;
  isFailedConnection?: boolean;
  sections?: SurveySection[];
};

export const surveyEditorInitialState: SurveyEditorState = {
  isSaving: false,
  isLoading: false,
  isCreating: false,
};

export const surveyEditorSlice = createSlice({
  name: 'survey/edit',
  initialState: surveyEditorInitialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    creatingStarted: (state) => {
      state.isCreating = true;
    },
    creatingFinished: (state) => {
      state.isCreating = false;
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
    setSurvey(state, action: PayloadAction<SurveyItem | undefined>) {
      state.survey = action.payload;
    },
    setSurveyErrors(state, action: PayloadAction<SurveyErrors>) {
      state.surveyErrors = action.payload;
    },
    clearSurveyTransientState(state) {
      state.lastTouchedOn = undefined;
      state.savedOn = undefined;
      state.surveyErrors = undefined;
    },
    updateLastTouched(state, action: PayloadAction<Timestamp | undefined>) {
      state.lastTouchedOn = action.payload ?? Date.now();
    },
    reset() {
      return { ...surveyEditorInitialState };
    },
  },
});

export const {
  loadingStarted,
  loadingFinished,
  creatingStarted,
  creatingFinished,
  savingStarted,
  savingFinished,
  setSurvey,
  setSurveyErrors,
  clearSurveyTransientState,
  updateLastTouched,
  reset,
} = surveyEditorSlice.actions;

export const loadSurvey =
  ({
    studyId,
    surveyId,
    onError,
  }: {
    studyId: string;
    surveyId: string;
    onError: () => void;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(loadingStarted());
      const { data } = await API.getTask({ projectId: studyId, id: surveyId });
      const [task] = data;
      const survey = surveyFromApi(studyId, task);
      dispatch(setSurvey(survey));
      dispatch(clearSurveyTransientState());
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      dispatch(loadingFinished());
    }
  };

const transformSurveyListItemToSurveyItem = (i: SurveyListItem): SurveyItem => ({
  studyId: '',
  id: '',
  revisionId: !_isUndefined(i.revisionId) ? i.revisionId : -1,
  title: i.title || '',
  description: i.description || '',
  questions: [],
});

export const openSurveyResults =
  ({ surveyId }: { surveyId: string }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const surveyList = surveyListDataSelector(getState());
    const preloadedSurveyItem = surveyList?.published.find((t) => t.id === surveyId);
    const surveyItem =
      preloadedSurveyItem && transformSurveyListItemToSurveyItem(preloadedSurveyItem);

    dispatch(setSurvey(surveyItem));
    dispatch(push(generatePath(Path.StudyManagementSurveyResults, { surveyId })));
  };

export const editSurvey =
  ({ surveyId }: { studyId: string; surveyId: string }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      const surveyList = surveyListDataSelector(getState());
      const preloadedSurveyItem = surveyList?.drafts.find((t) => t.id === surveyId);
      const surveyItem =
        preloadedSurveyItem && transformSurveyListItemToSurveyItem(preloadedSurveyItem);

      dispatch(setSurvey(surveyItem));
      dispatch(clearSurveyTransientState());
      dispatch(push(generatePath(Path.StudyManagementEditSurvey, { surveyId })));
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
    }
  };

export const AUTOSAVE_DEBOUNCE_INTERVAL = 100;

type SaveSurveyParams = { force?: boolean };

let lastParallelSaveParams: SaveSurveyParams | undefined;

export const saveSurveyIfRequired =
  (params: SaveSurveyParams): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { isSaving, lastTouchedOn, survey } = getState()[surveyEditorSlice.name];

    if (!survey || !lastTouchedOn) {
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

      const [apiTask] = (await API.getTask({ projectId: survey.studyId, id: survey.id })).data;
      const task = { ...apiTask, ...surveyUpdateToApi(survey) };
      const res = await API.updateTask(
        { projectId: survey.studyId, id: survey.id, revisionId: survey.revisionId },
        task
      );
      res.checkError();

      const list = surveyListDataSelector(getState());
      if (list) {
        const hasItem = list.drafts.findIndex((i) => i.id === task.id) > -1;
        const categories = sortTaskList(
          (hasItem ? updateDraftItem : pushDraftItem)(
            transformSurveyListItemFromApi(task as Task, 0, 0),
            list,
            (i) => ({
              ...i,
              modifiedAt: Date.now(),
            })
          )
        );

        dispatch(surveyListSlice.actions.setData({ data: categories }));
      }

      dispatch(savingFinished({ error: false }));
    } catch (err) {
      console.error(err);
      dispatch(savingFinished({ error: true, isFailedConnection: true }));
    } finally {
      if (lastParallelSaveParams) {
        const p = lastParallelSaveParams;
        lastParallelSaveParams = undefined;
        await dispatch(saveSurveyIfRequired(p));
      }
    }
  };

let autoSaveTimeoutId = 0;

export const autoSaveIfRequired = (): AppThunk => (dispatch) => {
  if (autoSaveTimeoutId) {
    clearTimeout(autoSaveTimeoutId);
  }
  autoSaveTimeoutId = window.setTimeout(async () => {
    await dispatch(saveSurveyIfRequired({ force: false }));
  }, AUTOSAVE_DEBOUNCE_INTERVAL);
};

export const createSurvey =
  ({ studyId }: { studyId: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(creatingStarted());

      const { data: task } = await API.createTask({ projectId: studyId });

      dispatch(
        setSurvey({
          studyId,
          id: task.id,
          revisionId: task.revisionId,
          title: SURVEY_TITLE_DEFAULT, // TODO: API creates survey with empty title by default, so we're overriding that to avoid confusing user
          description: '',
          questions: [
            emptySection({
              children: [emptyQuestion()],
            }),
          ],
        })
      );
      dispatch(clearSurveyTransientState());
      dispatch(updateLastTouched(Date.now()));
      await dispatch(saveSurveyIfRequired({ force: true }));
      dispatch(push(generatePath(Path.StudyManagementEditSurvey, { surveyId: task.id })));
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
    } finally {
      // TODO delete when create survey will be fixed
      setTimeout(() => dispatch(creatingFinished()), 100);
    }
  };

// TODO: should assume empty survey somehow else
export const editedSurveySelector = (state: RootState) =>
  state[surveyEditorSlice.name].survey || {
    studyId: '',
    id: '',
    revisionId: 0,
    title: '',
    description: '',
    questions: [],
  };

export const surveySavedOnSelector = (state: RootState) => state[surveyEditorSlice.name].savedOn;
export const surveyEditorIsLoadingSelector = (state: RootState) =>
  state[surveyEditorSlice.name].isLoading;
export const surveyEditorIsCreatingSelector = (state: RootState) =>
  state[surveyEditorSlice.name].isCreating;
export const surveyEditorIsSavingSelector = (state: RootState) =>
  state[surveyEditorSlice.name].isSaving;
export const surveyEditorSurveyErrorsSelector = (state: RootState) =>
  state[surveyEditorSlice.name].surveyErrors;
export const surveyEditorIsFailedConnectionSelector = (state: RootState) =>
  state[surveyEditorSlice.name].isFailedConnection;
export const surveyEditorLastTouchedSelector = (state: RootState) =>
  state[surveyEditorSlice.name].lastTouchedOn;
export const surveySectionsSelector = (state: RootState) =>
  state[surveyEditorSlice.name].survey?.questions;

const updateSurvey =
  (s: Partial<SurveyItem>): AppThunk =>
  (dispatch, getState) => {
    const surveyErrors = surveyEditorSurveyErrorsSelector(getState());
    const survey = removeInvalidSkipLogic({
      ...editedSurveySelector(getState()),
      ...s,
    });

    dispatch(setSurvey(survey));
    dispatch(updateLastTouched());
    dispatch(autoSaveIfRequired());
    surveyErrors &&
      dispatch(
        setSurveyErrors(
          getSurveyErrors({
            survey,
            currentErrors: surveyErrors,
          })
        )
      );
  };

const ADD_SECTION_MESSAGE = 'New section(s) were created to avoid potential display issues in App.';

type UseSurveyEditorParams = {
  canRecalculateSections?: (sections: SurveySection[]) => boolean;
};

export const useSurveyEditor = (params?: UseSurveyEditorParams) => {
  const { canRecalculateSections } = params || {};

  const survey = useAppSelector(editedSurveySelector);
  const isLoading = useAppSelector(surveyEditorIsLoadingSelector);
  const isCreating = useAppSelector(surveyEditorIsCreatingSelector);
  const isSaving = useAppSelector(surveyEditorIsSavingSelector);
  const surveyErrors = useAppSelector(surveyEditorSurveyErrorsSelector);
  const savedOn = useAppSelector(surveySavedOnSelector);
  const isFailedConnection = useAppSelector(surveyEditorIsFailedConnectionSelector);
  const lastTouchedOn = useAppSelector(surveyEditorLastTouchedSelector);

  const dispatch = useAppDispatch();
  const showSnack = useShowSnackbar();

  const load = useCallback(
    ({
      studyId,
      surveyId,
      onError,
    }: {
      studyId: string;
      surveyId: string;
      onError: () => void;
    }) => {
      if (!isLoading && studyId !== survey?.studyId && surveyId !== survey?.id) {
        dispatch(loadSurvey({ studyId, surveyId, onError }));
      }
    },
    [dispatch, isLoading, survey?.id, survey?.studyId]
  );

  const set = useCallback(
    (s: SurveyItem) => {
      if (!_isEqual(s, survey)) {
        dispatch(updateSurvey(s));
      }
    },
    [dispatch, survey]
  );

  const setPartial = useCallback(
    (s: Partial<SurveyItem>) => {
      dispatch(updateSurvey(s));
    },
    [dispatch]
  );

  const addQuestion = useCallback(
    (sectionId: string) => {
      set({
        ...survey,
        questions: survey.questions.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              children: [...section.children, emptyQuestion()],
            };
          }
          return section;
        }),
      });
    },
    [set, survey]
  );

  const updateQuestion = useCallback(
    (question: Partial<QuestionItem>) => {
      set({
        ...survey,
        questions: survey.questions.map((section) => ({
          ...section,
          children: section.children.map((q) =>
            q.id === question.id
              ? ({ ...q, ...question } as QuestionItem)
              : ({ ...q } as QuestionItem)
          ),
        })),
      });
    },
    [survey, set]
  );

  const copyQuestion = useCallback(
    (question: QuestionItem) => {
      const questionCopy = { ...question, id: newId() };

      set({
        ...survey,
        questions: survey.questions.map((section) => {
          if (section.children.find((i) => i.id === question.id)) {
            return {
              ...section,
              children: [...section.children, questionCopy],
            };
          }
          return section;
        }),
      });
      dispatch(showSnackbar({ text: 'Question copied successfully!' }));
    },
    [dispatch, survey, set]
  );

  const removeQuestion = useCallback(
    (question: Partial<QuestionItem>) => {
      set({
        ...survey,
        questions: survey.questions.map((s) => ({
          ...s,
          children: s.children.filter((q) => q.id !== question.id),
        })),
      });
    },
    [survey, set]
  );

  const validateSurvey = useCallback(() => {
    const se = getSurveyErrors({
      survey,
    });
    dispatch(setSurveyErrors(se));
    return se;
  }, [survey, dispatch]);

  const saveSurvey = useCallback(async () => {
    await dispatch(saveSurveyIfRequired({ force: true }));
  }, [dispatch]);

  const changeQuestionType = useCallback(
    (payload: Pick<QuestionItem, 'id' | 'type'>) => {
      set({
        ...survey,
        questions: survey.questions.map((s) => ({
          ...s,
          children: s.children.map((q) => {
            if (q.id !== payload.id) {
              return q;
            }
            return getQuestionHandler(payload.type).convertFromOtherType(q);
          }),
        })),
      });
    },
    [survey, set]
  );

  const setSections = useCallback(
    (s: SurveySection[]) => {
      set({ ...survey, questions: s });
    },
    [set, survey]
  );

  const addSection = useCallback(
    (parentSectionId?: SurveySection['id'], questions?: QuestionItem[]) => {
      const updatedSections = [...survey.questions];
      const parentSectionIdx = survey.questions.findIndex((s) => s.id === (parentSectionId || ''));

      updatedSections.splice(
        parentSectionIdx + 1,
        0,
        emptySection({
          title: '',
          children: questions ?? [emptyQuestion()],
        })
      );

      setSections(updatedSections);
    },
    [survey, setSections]
  );

  const removeSection = useCallback(
    (section: Pick<SurveySection, 'id'>) => {
      setSections(survey.questions.filter((q) => q.id !== section.id));
    },
    [survey, setSections]
  );

  const duplicateSection = useCallback(
    (section: Pick<SurveySection, 'id'>) => {
      const updatedSections = [...survey.questions];
      const duplicatedSectionIdx = updatedSections.findIndex((s) => s.id === section.id);
      const duplicatedSection = {
        ...updatedSections[duplicatedSectionIdx],
        id: newId(),
        children: updatedSections[duplicatedSectionIdx].children.map((i) => ({
          ...i,
          id: newId(),
        })),
      };

      updatedSections.splice(duplicatedSectionIdx + 1, 0, duplicatedSection);

      setSections(updatedSections);
    },
    [survey, setSections]
  );

  const mergeSection = useCallback(
    (section: Pick<SurveySection, 'id'>) => {
      const currentSectionIdx = survey.questions.findIndex((s) => s.id === section.id);
      const updatedSections = [...survey.questions];

      updatedSections[currentSectionIdx - 1] = {
        ...updatedSections[currentSectionIdx - 1],
        children: [
          ...updatedSections[currentSectionIdx - 1].children.map((q) => ({
            ...q,
            skipLogic: undefined,
          })),
          ...updatedSections[currentSectionIdx].children,
        ],
      };

      updatedSections.splice(currentSectionIdx, 1);

      setSections(updatedSections);
    },
    [survey, setSections]
  );

  const updateSection = useCallback(
    (section: Partial<Omit<SurveySection, 'id'>> & Pick<SurveySection, 'id'>) => {
      const updatedQuestions = [...survey.questions].map((s) =>
        s.id === section.id ? { ...s, ...section } : s
      );

      setSections(updatedQuestions);
    },
    [survey, setSections]
  );

  const prevSectionsCount = usePrevious(survey.questions?.length ?? 1);

  useEffect(() => {
    const recalculateSections = () => {
      if (!survey.questions || !canRecalculateSections?.(survey.questions)) {
        return;
      }

      if (survey.questions.length > 1) {
        const newSections: SurveySection[] = [];

        for (const s of survey.questions) {
          // get end question indexes for future sections
          const indexesOfQuestionsWithSkipLogic = s.children.reduce<number[]>(
            (acc, curr, idx, arr) => {
              if (curr.skipLogic || idx === arr.length - 1) {
                acc.push(idx);
              }
              return acc;
            },
            []
          );

          // split questions for chunks
          const chunksOfQuestions = indexesOfQuestionsWithSkipLogic.map((i, idx, arr) =>
            s.children.slice(!_isNil(arr[idx - 1]) ? arr[idx - 1] + 1 : 0, i + 1)
          );

          // create new sections from chunks
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          chunksOfQuestions.forEach((children, idx) =>
            newSections.push(idx === 0 ? { ...s, children } : emptySection({ children }))
          );
        }

        if (survey.questions.length !== newSections.length) {
          setSections(newSections);
          survey.questions.length < newSections.length &&
            showSnack({
              text: ADD_SECTION_MESSAGE,
            });
        }
      }
    };

    recalculateSections();
  }, [survey.questions, setSections, showSnack, canRecalculateSections, prevSectionsCount]);

  const resetAll = useCallback(() => dispatch(reset()), [dispatch]);

  return {
    survey,
    surveyErrors,
    loadSurvey: load,
    setSurvey: set,
    isLoading,
    isCreating,
    savedOn,
    addQuestion,
    changeQuestionType,
    updateSurvey: setPartial,
    updateQuestion,
    copyQuestion,
    removeQuestion,
    validateSurvey,
    saveSurvey,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
    addSection,
    removeSection,
    duplicateSection,
    mergeSection,
    updateSection,
    setSections,
    reset: resetAll,
  };
};

export default {
  [surveyEditorSlice.name]: surveyEditorSlice.reducer,
};
