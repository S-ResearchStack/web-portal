import { useCallback, useEffect } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import _isNil from 'lodash/isNil';
import _isEqual from 'lodash/isEqual';

import { newSurveyId } from '../utils';
import { Timestamp } from 'src/common/utils/datetime';
import useShowSnackbar from 'src/modules/snackbar/useShowSnackbar';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
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

export const MIN_SURVEY_SECTIONS = 2;

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

export interface SurveySection {
  id: string;
  title?: string;
  children: QuestionItem[];
}

export interface SurveyItem {
  studyId: string;
  id: string;
  title: string;
  description: string;
  questions: SurveySection[];
  iconUrl?: string;
}

export type SurveyQuestionErrors = {
  id: string;
  title: { empty?: boolean };
  value: { invalid?: boolean };
};

export type SurveyErrors = {
  title: { empty?: boolean };
  questions: SurveyQuestionErrors[];
};

export type SurveyEditorState = {
  isLoading: boolean;
  lastTouchedOn?: number;
  data?: SurveyItem;
  errors?: SurveyErrors;
  sections?: SurveySection[];
};

export const initialState: SurveyEditorState = {
  isLoading: false,
};

export const surveyEditorSlice = createSlice({
  name: 'task/surveyEditor',
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    setSurvey(state, action: PayloadAction<SurveyItem | undefined>) {
      state.data = action.payload;
    },
    setSurveyErrors(state, action: PayloadAction<SurveyErrors>) {
      state.errors = action.payload;
    },
    clearSurveyTransientState(state) {
      state.lastTouchedOn = undefined;
      state.errors = undefined;
    },
    updateLastTouched(state, action: PayloadAction<Timestamp | undefined>) {
      state.lastTouchedOn = action.payload ?? Date.now();
    },
    reset() {
      return { ...initialState };
    },
  },
});

export const {
  loadingStarted,
  loadingFinished,
  setSurvey,
  setSurveyErrors,
  clearSurveyTransientState,
  updateLastTouched,
  reset,
} = surveyEditorSlice.actions;

const emptySingleSelectionQuestion = () => ({
  ...questionHandlers.single.createEmpty(),
});

const emptySection = (s?: Partial<SurveySection>): SurveySection => ({
  id: newSurveyId(),
  children: [],
  ...s,
});

const newSurvey = (studyId: string): SurveyItem => ({
  studyId,
  id: '',
  title: '',
  description: '',
  questions: [
    emptySection({ children: [emptySingleSelectionQuestion()] })
  ],
});
type GenerateParams = {
  studyId: string;
};
export const generateSurvey =
  ({
    studyId,
  }: GenerateParams): AppThunk<Promise<void>> =>
    async (dispatch) => {
      dispatch(loadingStarted());

      const survey = newSurvey(studyId);
      dispatch(setSurvey(survey));
      dispatch(clearSurveyTransientState());

      dispatch(loadingFinished());
    };

const isInvalid = (q: QuestionItem) => {
  if (q.type === 'slider' && q.answers[0].value >= q.answers[1].value) return true;
  return false;
}
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
        value: {
          invalid: cur.questions.find((qq) => qq.id === q.id)?.value.invalid && isInvalid(q),
        }
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
      value: {
        invalid: isInvalid(q),
      }
    })),
  };
};

export const hasSurveyTitleErrors = (se: SurveyErrors) => !!se.title.empty;
export const hasSurveyQuestionErrors = (qe: SurveyQuestionErrors) => !!qe.title.empty || !!qe.value.invalid;
export const hasSomeSurveyErrors = (se: SurveyErrors) =>
  hasSurveyTitleErrors(se) || se.questions.some(hasSurveyQuestionErrors);

// TODO: should assume empty survey somehow else
export const editedSurveySelector = (state: RootState) =>
  state[surveyEditorSlice.name].data || {
    studyId: '',
    id: '',
    title: '',
    description: '',
    questions: [],
  };

export const surveyEditorIsLoadingSelector = (state: RootState) =>
  state[surveyEditorSlice.name].isLoading;
export const surveyEditorSurveyErrorsSelector = (state: RootState) =>
  state[surveyEditorSlice.name].errors;

export const updateSurvey =
  (s: Partial<SurveyItem>): AppThunk =>
    (dispatch, getState) => {
      const surveyErrors = surveyEditorSurveyErrorsSelector(getState());
      const survey = {
        ...editedSurveySelector(getState()),
        ...s,
      };

      dispatch(setSurvey(survey));
      dispatch(updateLastTouched());
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
  const surveyErrors = useAppSelector(surveyEditorSurveyErrorsSelector);
  const lastTouchedOn = useAppSelector((state: RootState) => state[surveyEditorSlice.name].lastTouchedOn);

  const dispatch = useAppDispatch();
  const showSnack = useShowSnackbar();

  const generate = useCallback(
    (params: GenerateParams) => {
      dispatch(generateSurvey(params));
    },
    [dispatch]
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
      set({ ...survey, ...s });
    },
    [survey, set]
  );

  const addQuestion = useCallback(
    (sectionId: string) => {
      set({
        ...survey,
        questions: survey.questions.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              children: [...section.children, emptySingleSelectionQuestion()],
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
      const questionCopy = { ...question, id: newSurveyId() };

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
          children: questions ?? [emptySingleSelectionQuestion()],
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
        id: newSurveyId(),
        children: updatedSections[duplicatedSectionIdx].children.map((i) => ({
          ...i,
          id: newSurveyId(),
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
              if (idx === arr.length - 1) {
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
    isLoading,
    survey,
    surveyErrors,
    lastTouchedOn,
    generateSurvey: generate,
    setSurvey: set,
    updateSurvey: setPartial,
    addQuestion,
    copyQuestion,
    updateQuestion,
    changeQuestionType,
    removeQuestion,
    validateSurvey,
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
