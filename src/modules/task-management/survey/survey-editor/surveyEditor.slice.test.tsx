import React from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor, act } from '@testing-library/react';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { currentSnackbarSelector } from 'src/modules/snackbar/snackbar.slice';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import {
  generateSurvey,
  editedSurveySelector,
  getSurveyErrors,
  hasSomeSurveyErrors,
  hasSurveyQuestionErrors,
  hasSurveyTitleErrors,
  initialState as surveyEditorInitialState,
  surveyEditorIsLoadingSelector,
  surveyEditorSlice,
  SurveyEditorState,
  SurveyErrors,
  SurveyItem,
  useSurveyEditor,
} from './surveyEditor.slice';
import {
  SurveyListSliceFetchArgs,
  useSurveyListData,
} from '../surveyList.slice';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('surveyEditorSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(surveyEditorSlice.reducer(undefined, { type: '' })).toEqual(surveyEditorInitialState);
  });

  it('should support survey loading successful lifecycle', () => {
    const loadingState = surveyEditorSlice.reducer(
      undefined,
      surveyEditorSlice.actions.loadingStarted()
    );
    expect(loadingState).toMatchObject({ isLoading: true });
    expect(
      surveyEditorSlice.reducer(loadingState, surveyEditorSlice.actions.loadingFinished())
    ).toMatchObject({ isLoading: false });
  });

  it('should set survey', () => {
    const survey = {
      studyId: 'study-id',
      id: 'id',
      title: 'test-title',
      description: 'test-description',
      questions: [],
      schedule: '',
      startTime: '',
      endTime: '',
      validMin: 0,
      duration: '',
    };
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.setSurvey(survey))
    ).toMatchObject({
      isLoading: false,
      data: survey
    });
  });

  it('[NEGATIVE] should set errors', () => {
    const surveyErrors: SurveyErrors = {
      title: { empty: true },
      questions: [
        {
          id: 'id',
          title: { empty: true },
          value: { invalid: true },
        },
      ],
    };

    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.setSurveyErrors(surveyErrors))
    ).toMatchObject({
      isLoading: false,
      errors: surveyErrors
    });
  });

  it('should touch', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
    dateSpy.mockReturnValue(1);

    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.updateLastTouched())
    ).toMatchObject({ lastTouchedOn: 1 });
  });

  it('should clear transient state', () => {
    expect(
      surveyEditorSlice.reducer(
        {
          lastTouchedOn: 1,
          errors: [],
        } as unknown as SurveyEditorState,
        surveyEditorSlice.actions.clearSurveyTransientState()
      )
    ).toMatchObject({
      lastTouchedOn: undefined,
      errors: undefined,
    });
  });

  it('should reset state', () => {
    expect(
      surveyEditorSlice.reducer(
        {
          isLoading: true,
          lastTouchedOn: 1,
          errors: [],
        } as unknown as SurveyEditorState,
        surveyEditorSlice.actions.reset()
      )
    ).toMatchObject({
      isLoading: false,
    });
  });
});

const studyId = 'test-study';

const survey: SurveyItem = {
  studyId: '',
  id: '1',
  title: 'test-title',
  description: '',
  questions: [
    {
      id: 'category-id',
      title: '',
      children: [
        {
          id: '1',
          title: 'test-title',
          type: 'single',
          description: '',
          options: {
            optional: true,
            includeOther: false,
          },
          answers: [],
        },
      ],
    },
  ],
};

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;
});

describe('actions', () => {
  const setUpSurveyListHook = (args: SurveyListSliceFetchArgs | false) =>
    renderHook(
      (fetchArgs: SurveyListSliceFetchArgs) => useSurveyListData({ fetchArgs: fetchArgs || args }),
      {
        wrapper: ({ children }: React.PropsWithChildren) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );

  let hook: ReturnType<typeof setUpSurveyListHook>;

  const unsetHook = (h: ReturnType<typeof setUpSurveyListHook>) => {
    act(() => {
      h.result.current.reset();
      h.unmount();
    });
  };

  describe('generateSurvey', () => {
    it('should generate survey', async () => {
      expect(surveyEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        title: '',
        description: '',
        questions: [],
      });

      dispatch(generateSurvey({ studyId }));

      await waitFor(() => surveyEditorIsLoadingSelector(store.getState()));
      await waitFor(() => !surveyEditorIsLoadingSelector(store.getState()));

      expect(editedSurveySelector(store.getState())).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          id: '',
          questions: expect.arrayContaining([expect.any(Object)]),
          studyId,
          title: expect.any(String),
        })
      );
    });
  });
});

describe('getSurveyErrors', () => {
  it('[NEGATIVE] should catch errors', () => {
    const invalidSurvey: SurveyItem = {
      ...survey,
      title: '', // invalid
      questions: [
        {
          ...survey.questions[0],
          children: [
            {
              ...survey.questions[0].children[0],
              title: '', // invalid
            },
          ],
        },
      ],
    };

    expect(
      getSurveyErrors({
        survey: invalidSurvey,
      })
    ).toEqual({
      title: { empty: true },
      questions: [
        {
          id: survey.questions[0].children[0].id,
          title: { empty: true },
          value: { invalid: false }
        },
      ],
    });
  });

  it('[NEGATIVE] should find difference of errors', () => {
    expect(
      getSurveyErrors({
        survey,
        currentErrors: {
          title: {
            empty: true,
          },
          questions: [
            {
              id: survey.questions[0].children[0].id,
              title: { empty: true },
              value: { invalid: true },
            },
          ],
        },
      })
    ).toEqual({
      title: { empty: false },
      questions: [
        {
          id: survey.questions[0].children[0].id,
          title: { empty: false },
          value: { invalid: false }
        },
      ],
    });
  });
});

describe('hasSurveyTitleErrors', () => {
  it('[NEGATIVE] should catch error', () => {
    expect(
      hasSurveyTitleErrors({
        title: {
          empty: true,
        },
        questions: [
          {
            id: survey.questions[0].id,
            title: {
              empty: true,
            },
            value: {
              invalid: true
            },
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('hasSurveyQuestionErrors', () => {
  it('[NEGATIVE] should catch error', () => {
    expect(
      hasSurveyQuestionErrors({
        id: survey.questions[0].id,
        title: {
          empty: true,
        },
        value: {
          invalid: true
        },
      })
    ).toBeTruthy();
  });
});

describe('hasSomeSurveyErrors', () => {
  it('[NEGATIVE] should catch error', () => {
    expect(
      hasSomeSurveyErrors({
        title: { empty: true },
        questions: [
          {
            id: survey.questions[0].id,
            title: { empty: false },
            value: { invalid: true },
          },
        ],
      })
    ).toBeTruthy();

    expect(
      hasSomeSurveyErrors({
        title: { empty: false },
        questions: [
          {
            id: survey.questions[0].id,
            title: { empty: true },
            value: { invalid: true },
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('useSurveyEditor', () => {
  const setUpSurveyEditorHook = () =>
    renderHook(() => useSurveyEditor(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

  let hook: ReturnType<typeof setUpSurveyEditorHook>;

  const unsetHook = (h: ReturnType<typeof setUpSurveyEditorHook>) => {
    act(() => {
      h.unmount();
    });
  };

  afterEach(() => {
    unsetHook(hook);
  });

  describe('generateSurvey', () => {
    it('should generate survey', async () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.generateSurvey({
          studyId,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.survey).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
            }),
          ]),
        })
      );
    });
  });

  describe('setSurvey', () => {
    it('should set survey', () => {
      hook = setUpSurveyEditorHook();

      expect(hook.result.current.lastTouchedOn).toBeUndefined();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      expect(hook.result.current.lastTouchedOn).toEqual(expect.any(Number));
      expect(hook.result.current.survey).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
            }),
          ]),
        })
      );
    });
  });

  describe('addQuestion', () => {
    it('should add question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const { length } = hook.result.current.survey.questions;

      act(() => {
        hook.result.current.addQuestion(survey.questions[0].id);
      });

      expect(hook.result.current.survey.questions[0].children).toHaveLength(length + 1);
    });
  });

  describe('copyQuestion', () => {
    it('should copy question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const { length } = hook.result.current.survey.questions;
      const question = hook.result.current.survey.questions[0].children[0];

      act(() => {
        hook.result.current.copyQuestion(question);
      });

      expect(hook.result.current.survey.questions[0].children).toHaveLength(length + 1);
      expect(hook.result.current.survey.questions[0].children[length]).toEqual({
        ...question,
        id: expect.any(String),
      });
      expect(currentSnackbarSelector(store.getState()).text).toEqual(expect.any(String));
    });
  });

  describe('updateQuestion', () => {
    it('should update question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const testedQuestion = hook.result.current.survey.questions[0].children[0];
      const updates = { title: 'updated-title' };

      act(() => {
        hook.result.current.updateQuestion({ id: testedQuestion.id, ...updates });
      });

      expect(hook.result.current.survey.questions[0].children[0]).toEqual({
        ...testedQuestion,
        ...updates,
      });
    });
  });

  describe('removeQuestion', () => {
    it('should remove question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const { length } = hook.result.current.survey.questions;

      act(() => {
        hook.result.current.removeQuestion({
          id: hook.result.current.survey.questions[0].children[0].id,
        });
      });

      expect(hook.result.current.survey.questions[0].children).toHaveLength(length - 1);
    });
  });

  describe('validateSurvey', () => {
    it('[NEGATIVE] should catch errors', () => {
      hook = setUpSurveyEditorHook();

      const invalidSurvey: SurveyItem = {
        ...survey,
        title: '', // invalid
        questions: [
          {
            ...survey.questions[0],
            children: [
              {
                ...survey.questions[0].children[0],
                title: '', // invalid
              },
            ],
          },
        ],
      };

      const error = {
        title: { empty: true },
        questions: [
          {
            id: survey.questions[0].children[0].id,
            title: { empty: true },
            value: { invalid: false }
          },
        ],
      };

      expect(hook.result.current.surveyErrors).toBeUndefined();

      act(() => {
        hook.result.current.setSurvey(invalidSurvey);
      });

      act(() => {
        expect(hook.result.current.validateSurvey()).toEqual(error);
      });

      expect(hook.result.current.surveyErrors).toEqual(error);
    });
  });

  describe('updateSurvey', () => {
    it('should update survey', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      expect(hook.result.current.survey).toEqual(survey);

      const updates = { id: 'test-id' };
      const updatedSurvey = { ...survey, ...updates };

      act(() => {
        hook.result.current.updateSurvey(updates);
      });

      expect(hook.result.current.survey).toEqual(updatedSurvey);
    });
  });

  describe('addSection & removeSection', () => {
    it('should add section', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const { length } = hook.result.current.survey.questions;

      act(() => {
        hook.result.current.addSection(survey.questions[0].id);
      });

      expect(hook.result.current.survey.questions).toHaveLength(length + 1);

      act(() => {
        hook.result.current.removeSection(survey.questions[0]);
      });

      expect(hook.result.current.survey.questions).toHaveLength(length);
    });
  });

  describe('duplicateSection', () => {
    it('should add question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const { length } = hook.result.current.survey.questions;

      act(() => {
        hook.result.current.duplicateSection(survey.questions[0]);
      });

      expect(hook.result.current.survey.questions).toHaveLength(length + 1);
    });
  });
});
