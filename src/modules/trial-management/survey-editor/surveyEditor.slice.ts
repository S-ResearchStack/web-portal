import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';
import { push } from 'connected-react-router';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _uniqueId from 'lodash/uniqueId';
import _isUndefined from 'lodash/isUndefined';

import API, { ChoiceQuestion, ScaleQuestion, TaskItemQuestion, TaskUpdate } from 'src/modules/api';
import { Task, TaskItem } from 'src/modules/api/models/tasks';
import { Path } from 'src/modules/navigation/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import {
  mockTasks,
  surveyListDataSelector,
  SurveyListItem,
  surveyListSlice,
} from '../surveyList.slice';

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
      mockTasks[idx] = { ...mockTasks[idx], ...task } as Task;
    }
    return API.mock.response(undefined);
  },
});

export const newId = () => _uniqueId('survey');

export interface BaseAnswer {
  id: string;
}

export interface SelectableAnswer extends BaseAnswer {
  value: string;
}

export interface ScalableAnswer extends BaseAnswer {
  label: string;
  value: number;
}

export type QuestionType = 'single' | 'multiple' | 'slider';

export interface QuestionItem {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  optional: boolean;
  answers: Array<SelectableAnswer | ScalableAnswer>;
}

export interface SurveyItem {
  studyId: string;
  id: string;
  revisionId: number;
  title: string;
  description: string;
  questions: QuestionItem[];
}

export type SurveyQuestionErrors = {
  id: string;
  title: { empty?: boolean };
};

export type SurveyErrors = {
  title: { empty?: boolean };
  questions: SurveyQuestionErrors[];
};

export const emptyQuestion = () =>
  ({
    id: newId(),
    type: 'single',
    title: '',
    description: '',
    optional: false,
    answers: [
      { id: newId(), value: '' },
      { id: newId(), value: '' },
    ],
  } as QuestionItem);

export const surveyQuestionFromApi = (ti: TaskItem): QuestionItem | undefined => {
  if (ti.type !== 'QUESTION') {
    return undefined;
  }

  const q = ti.contents as TaskItemQuestion;

  if (!['CHOICE', 'SCALE'].includes(q.type)) {
    return undefined;
  }

  const questionDataByType = (() => {
    if (q.type === 'CHOICE') {
      const props = q.properties as ChoiceQuestion;
      return {
        type: props.tag === 'CHECKBOX' ? 'multiple' : 'single',
        answers: props.options.map((o) => ({
          id: newId(),
          value: o.value,
        })) as SelectableAnswer[],
      };
    }
    if (q.type === 'SCALE') {
      const props = q.properties as ScaleQuestion;
      return {
        type: 'slider',
        answers: [
          { id: 'low', label: props.lowLabel || '', value: props.low },
          { id: 'high', label: props.highLabel || '', value: props.high },
        ] as ScalableAnswer[],
      };
    }
    return undefined;
  })();

  return {
    id: ti.name || newId(),
    title: q.title || '',
    description: q.explanation || '',
    optional: !q.required,
    ...questionDataByType,
  } as QuestionItem;
};

export const surveyQuestionListFromApi = (ti: TaskItem[]): QuestionItem[] =>
  ti
    .sort((a, b) => a.sequence - b.sequence)
    .map(surveyQuestionFromApi)
    .filter(Boolean) as QuestionItem[];

export const surveyFromApi = (studyId: string, t: Task): SurveyItem => ({
  studyId,
  id: t.id,
  revisionId: t.revisionId,
  title: t.title || '',
  description: t.description || '',
  questions: surveyQuestionListFromApi(t.items),
});

export const surveyUpdateToApi = (s: SurveyItem): TaskUpdate => ({
  title: s.title,
  description: s.description,
  items: s.questions
    .map((q, idx) => {
      const questionContents = (() => {
        const base = {
          title: q.title,
          explanation: q.description,
          required: !q.optional,
        };

        if (q.type === 'single' || q.type === 'multiple') {
          return {
            ...base,
            type: 'CHOICE',
            properties: {
              tag: q.type === 'single' ? 'RADIO' : 'CHECKBOX',
              options: q.answers.map((a) => ({ value: a.value })),
            } as ChoiceQuestion,
          };
        }
        if (q.type === 'slider') {
          const [low, high] = q.answers as ScalableAnswer[];
          return {
            ...base,
            type: 'SCALE',
            properties: {
              tag: 'SLIDER',
              low: low.value,
              lowLabel: low.label,
              high: high.value,
              highLabel: high.label,
            } as ScaleQuestion,
          };
        }
        console.warn(`Unhandled question type ${q.type}`);
        return undefined;
      })() as TaskItemQuestion;

      if (!questionContents) {
        return undefined;
      }

      return {
        name: q.id,
        sequence: idx,
        type: 'QUESTION',
        contents: questionContents,
      };
    })
    .filter(Boolean) as TaskItem[],
});

export const getSurveyErrors = ({
  survey: s,
  currentErrors: cur,
}: {
  survey: SurveyItem;
  currentErrors?: SurveyErrors;
}): SurveyErrors => {
  // only clear existing errors
  if (cur) {
    return {
      title: {
        empty: cur.title.empty && !s.title,
      },
      questions: s.questions.map((q) => ({
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
    questions: s.questions.map((q) => ({
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
    updateLastTouched(state) {
      state.lastTouchedOn = Date.now();
    },
  },
});

const {
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
} = surveyEditorSlice.actions;

export const CREATE_SURVEY_FAILED_MESSAGE = 'Failed to create survey';

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
          title: '',
          description: '',
          questions: [emptyQuestion()],
        })
      );
      dispatch(clearSurveyTransientState());
      dispatch(push(generatePath(Path.TrialManagementEditSurvey, { surveyId: task.id })));
    } catch (err) {
      console.error(err);
      // TODO: what to show?
      dispatch(showSnackbar({ text: CREATE_SURVEY_FAILED_MESSAGE }));
    } finally {
      // TODO delete when create survey will be fixed
      setTimeout(() => dispatch(creatingFinished()), 100);
    }
  };

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
      dispatch(setSurvey(surveyFromApi(studyId, task)));
      dispatch(clearSurveyTransientState());
    } catch (err) {
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
    dispatch(push(generatePath(Path.TrialManagementSurveyResults, { surveyId })));
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
      dispatch(push(generatePath(Path.TrialManagementEditSurvey, { surveyId })));
    } catch (err) {
      // TODO: what to show?
      console.error(err);
    }
  };

export const AUTOSAVE_DEBOUNCE_INTERVAL = 3000;

export const saveSurveyIfRequired =
  ({ force }: { force?: boolean }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { isSaving, lastTouchedOn, survey } = getState()[surveyEditorSlice.name];

    if (
      !survey ||
      isSaving ||
      !lastTouchedOn ||
      (!force && Date.now() - lastTouchedOn <= AUTOSAVE_DEBOUNCE_INTERVAL)
    ) {
      return;
    }

    if (
      hasSomeSurveyErrors(
        getSurveyErrors({
          survey,
        })
      )
    ) {
      return;
    }

    try {
      dispatch(savingStarted());

      const [apiTask] = (await API.getTask({ projectId: survey.studyId, id: survey.id })).data;
      const res = await API.updateTask(
        { projectId: survey.studyId, id: survey.id, revisionId: survey.revisionId },
        { ...apiTask, ...surveyUpdateToApi(survey) }
      );

      res.checkError();
      // TODO: find a better way to refetch only when necessary
      dispatch(surveyListSlice.actions.refetch());
      dispatch(savingFinished({ error: false }));
    } catch (err) {
      dispatch(savingFinished({ error: true, isFailedConnection: true }));
    }
  };

let autoSaveTimeoutId = 0;

export const autoSaveIfRequired = (): AppThunk<void> => (dispatch) => {
  if (autoSaveTimeoutId) {
    clearTimeout(autoSaveTimeoutId);
  }
  autoSaveTimeoutId = window.setTimeout(async () => {
    await dispatch(saveSurveyIfRequired({ force: false }));
  }, AUTOSAVE_DEBOUNCE_INTERVAL);
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

export const useSurveyEditor = () => {
  const survey = useAppSelector(editedSurveySelector);
  const isLoading = useAppSelector(surveyEditorIsLoadingSelector);
  const isCreating = useAppSelector(surveyEditorIsCreatingSelector);
  const isSaving = useAppSelector(surveyEditorIsSavingSelector);
  const surveyErrors = useAppSelector(surveyEditorSurveyErrorsSelector);
  const savedOn = useAppSelector(surveySavedOnSelector);
  const isFailedConnection = useAppSelector(surveyEditorIsFailedConnectionSelector);
  const lastTouchedOn = useAppSelector(surveyEditorLastTouchedSelector);
  const dispatch = useAppDispatch();

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
      dispatch(setSurvey(s));
      dispatch(updateLastTouched());
      dispatch(autoSaveIfRequired());
      surveyErrors &&
        dispatch(
          setSurveyErrors(
            getSurveyErrors({
              survey: s,
              currentErrors: surveyErrors,
            })
          )
        );
    },
    [dispatch, surveyErrors]
  );

  const updateSurvey = useCallback(
    (s: Partial<SurveyItem>) => {
      set({ ...survey, ...s });
    },
    [survey, set]
  );

  const addQuestion = useCallback(() => {
    set({
      ...survey,
      questions: [...survey.questions, emptyQuestion()],
    });
  }, [set, survey]);

  const updateQuestion = useCallback(
    (question: Partial<QuestionItem>) => {
      set({
        ...survey,
        questions: survey.questions.map((q) =>
          q.id === question.id ? { ...q, ...question } : { ...q }
        ),
      });
    },
    [survey, set]
  );

  const copyQuestion = useCallback(
    (question: QuestionItem) => {
      const questionCopy = { ...question, id: `${newId()}` };
      set({ ...survey, questions: [...survey.questions, questionCopy] });
      dispatch(showSnackbar({ text: 'Question copied successfully!' }));
    },
    [dispatch, survey, set]
  );

  const removeQuestion = useCallback(
    (question: Partial<QuestionItem>) => {
      set({
        ...survey,
        questions: survey.questions.filter((q) => q.id !== question.id),
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

  return {
    survey,
    surveyErrors,
    loadSurvey: load,
    setSurvey: set,
    isLoading,
    isCreating,
    savedOn,
    addQuestion,
    updateSurvey,
    updateQuestion,
    copyQuestion,
    removeQuestion,
    validateSurvey,
    saveSurvey,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
  };
};

export default {
  [surveyEditorSlice.name]: surveyEditorSlice.reducer,
};
