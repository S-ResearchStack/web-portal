import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from 'src/modules/store';

type SkipLogicState = {
  editQuestionId: string | undefined;
  isDrawerOpen: boolean;
};

const skipLogicInitialState: SkipLogicState = {
  editQuestionId: undefined,
  isDrawerOpen: false,
};

const skipLogicSlice = createSlice({
  name: 'survey/edit/skipLogic',
  initialState: skipLogicInitialState,
  reducers: {
    setEditQuestionId: (state, action: PayloadAction<string | undefined>) => {
      state.editQuestionId = action.payload;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
  },
});

const { setEditQuestionId, setDrawerOpen } = skipLogicSlice.actions;

export const startEditSkipLogic =
  (questionId: string): AppThunk =>
  (dispatch, getState) => {
    const questions = getState()['survey/edit'].survey?.questions;
    const targetQuestion = questions
      ?.map((s) => s.children)
      .flat()
      .find((q) => q.id === questionId);
    if (targetQuestion) {
      dispatch(setEditQuestionId(questionId));
      dispatch(setDrawerOpen(true));
    }
  };

export const stopEditSkipLogic = (): AppThunk => (dispatch) => {
  dispatch(setDrawerOpen(false));
};

export const cleanupEditSkipLogicQuestion = (): AppThunk => (dispatch) => {
  dispatch(setEditQuestionId(undefined));
};

export const skipLogicEditQuestionSelector = createSelector(
  [
    (state: RootState) => state['survey/edit'].survey?.questions,
    (state: RootState) => state[skipLogicSlice.name].editQuestionId,
  ],
  (sections, questionId) => {
    const questions = sections?.map((s) => s.children).flat();
    const questionIndex = questions?.findIndex((q) => q.id === questionId);
    return questionIndex !== undefined && questionIndex >= 0 && questions
      ? {
          question: questions[questionIndex],
          questionIndex,
        }
      : undefined;
  }
);

export const isEditingSkipLogicSelector = (state: RootState) =>
  !!state[skipLogicSlice.name].isDrawerOpen;

export default {
  [skipLogicSlice.name]: skipLogicSlice.reducer,
};
