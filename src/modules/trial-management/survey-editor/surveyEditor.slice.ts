import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';
import { push } from 'connected-react-router';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import _uniqueId from 'lodash/uniqueId';

import API, { ChoiceQuestion, ScaleQuestion, TaskItemQuestion, TaskUpdate } from 'src/modules/api';
import { Task, TaskItem } from 'src/modules/api/models/tasks';
import { Path } from 'src/modules/navigation/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { mockTasks, surveyListSlice } from '../surveyList.slice';

API.mock.provideEndpoints({
  createTask() {
    return API.mock.response({
      id: _uniqueId('task'),
      revisionId: 0,
    });
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

const emptyQuestion = () =>
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

const surveyQuestonFromApi = (ti: TaskItem): QuestionItem | undefined => {
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
    .map(surveyQuestonFromApi)
    .filter(Boolean) as QuestionItem[];

const surveyFromApi = (studyId: string, t: Task): SurveyItem => ({
  studyId,
  id: t.id,
  revisionId: t.revisionId,
  title: t.title || '',
  description: t.description || '',
  questions: surveyQuestionListFromApi(t.items),
});

const surveyUpdateToApi = (s: SurveyItem): TaskUpdate => ({
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

const getSurveyErrors = ({
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

const hasSomeSurveyErrors = (se: SurveyErrors) =>
  se.title.empty || se.questions.some((q) => q.title.empty);

type SurveyEditorState = {
  isSaving: boolean;
  isLoading: boolean;
  isCreating: boolean;
  lastTouchedOn?: number;
  savedOn?: number;
  survey?: SurveyItem;
  surveyErrors?: SurveyErrors;
};

const initialState: SurveyEditorState = {
  isSaving: false,
  isLoading: false,
  isCreating: false,
};

export const surveyEditorSlice = createSlice({
  name: 'survey/edit',
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    cratingStarted: (state) => {
      state.isCreating = true;
    },
    creatingFinished: (state) => {
      state.isCreating = false;
    },
    savingStarted: (state) => {
      state.isSaving = true;
    },
    savingFinished: (state, action: PayloadAction<{ error?: boolean }>) => {
      state.isSaving = false;
      if (!action.payload.error) {
        state.savedOn = Date.now();
      }
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
  cratingStarted,
  creatingFinished,
  savingStarted,
  savingFinished,
  setSurvey,
  setSurveyErrors,
  clearSurveyTransientState,
  updateLastTouched,
} = surveyEditorSlice.actions;

export const createSurvey =
  ({ studyId }: { studyId: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(cratingStarted());

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
      dispatch(showSnackbar({ text: 'Failed to create survey' }));
    } finally {
      // TODO delete when create survey will be fixed
      setTimeout(() => dispatch(creatingFinished()), 100);
    }
  };

const loadSurvey =
  ({ studyId, surveyId }: { studyId: string; surveyId: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(loadingStarted());
      const { data } = await API.getTask({ projectId: studyId, id: surveyId });
      const [task] = data;
      dispatch(setSurvey(surveyFromApi(studyId, task)));
      dispatch(clearSurveyTransientState());
    } finally {
      dispatch(loadingFinished());
    }
  };

export const editSurvey =
  ({ surveyId }: { studyId: string; surveyId: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(setSurvey(undefined));
      dispatch(clearSurveyTransientState());
      dispatch(push(generatePath(Path.TrialManagementEditSurvey, { surveyId })));
    } catch (err) {
      // TODO: what to show?
      console.error(err);
    }
  };

const AUTOSAVE_DEBOUNCE_INTERVAL = 3000;

const saveIfRequired =
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
      dispatch(savingFinished({ error: true }));
      dispatch(showSnackbar({ text: 'Failed to save' }));
    }
  };

let autoSaveTimeoutId = 0;

export const autoSaveIfRequired = (): AppThunk<void> => (dispatch) => {
  if (autoSaveTimeoutId) {
    clearTimeout(autoSaveTimeoutId);
  }
  autoSaveTimeoutId = window.setTimeout(async () => {
    await dispatch(saveIfRequired({ force: false }));
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

const surveySavedOnSelector = (state: RootState) => state[surveyEditorSlice.name].savedOn;

export const useSurveyEditor = () => {
  const survey = useAppSelector(editedSurveySelector);
  const isLoading = useAppSelector((state) => state[surveyEditorSlice.name].isLoading);
  const isCreating = useAppSelector((state) => state[surveyEditorSlice.name].isCreating);
  const surveyErrors = useAppSelector((state) => state[surveyEditorSlice.name].surveyErrors);
  const savedOn = useAppSelector(surveySavedOnSelector);
  const dispatch = useAppDispatch();

  const load = useCallback(
    ({ studyId, surveyId }: { studyId: string; surveyId: string }) => {
      if (!isLoading && studyId !== survey?.studyId && surveyId !== survey?.id) {
        dispatch(loadSurvey({ studyId, surveyId }));
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
      const questions = [...survey.questions];
      const idx = questions.map((q) => q.id).indexOf(question.id);
      const questionCopy = { ...question, id: `${newId()}` };
      questions.splice(idx + 1, 0, questionCopy);
      set({ ...survey, questions });
    },
    [survey, set]
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
    return !hasSomeSurveyErrors(se);
  }, [survey, dispatch]);

  const saveSurvey = useCallback(async () => {
    await dispatch(saveIfRequired({ force: true }));
  }, [dispatch]);

  return {
    survey,
    surveyErrors,
    loadSurvey: load,
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
  };
};

export default {
  [surveyEditorSlice.name]: surveyEditorSlice.reducer,
};
