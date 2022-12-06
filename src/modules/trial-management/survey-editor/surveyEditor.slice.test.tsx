import React from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor, act } from '@testing-library/react';
import { matchPath } from 'react-router-dom';

import {
  AUTOSAVE_DEBOUNCE_INTERVAL,
  autoSaveIfRequired,
  CREATE_SURVEY_FAILED_MESSAGE,
  createSurvey,
  editedSurveySelector,
  editSurvey,
  emptyQuestion,
  getSurveyErrors,
  hasSomeSurveyErrors,
  hasSurveyQuestionErrors,
  hasSurveyTitleErrors,
  loadSurvey,
  newId,
  openSurveyResults,
  saveSurveyIfRequired,
  surveyEditorInitialState,
  surveyEditorIsCreatingSelector,
  surveyEditorIsFailedConnectionSelector,
  surveyEditorIsLoadingSelector,
  surveyEditorIsSavingSelector,
  surveyEditorLastTouchedSelector,
  surveyEditorSlice,
  SurveyEditorState,
  surveyEditorSurveyErrorsSelector,
  SurveyErrors,
  surveyFromApi,
  SurveyItem,
  surveyQuestionFromApi,
  surveyQuestionListFromApi,
  surveySavedOnSelector,
  surveyUpdateToApi,
  useSurveyEditor,
} from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import {
  findMockTaskById,
  mockTasks,
  SurveyListSliceFetchArgs,
  useSurveyListData,
} from 'src/modules/trial-management/surveyList.slice';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { currentSnackbarSelector } from 'src/modules/snackbar/snackbar.slice';
import Api, { TaskItem } from 'src/modules/api';
import { expectToBeDefined } from 'src/common/utils/testing';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('surveyEditorSlice', () => {
  it('should make empty state', () => {
    expect(surveyEditorSlice.reducer(undefined, { type: '' })).toEqual(surveyEditorInitialState);
  });

  it('should start loading', () => {
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.loadingStarted())
    ).toMatchObject({ isLoading: true });
  });

  it('should finish loading', () => {
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.loadingFinished())
    ).toMatchObject({ isLoading: false });
  });

  it('should start creating', () => {
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.creatingStarted())
    ).toMatchObject({ isCreating: true });
  });

  it('should finish creating', () => {
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.creatingFinished())
    ).toMatchObject({ isCreating: false });
  });

  it('should start saving', () => {
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.savingStarted())
    ).toMatchObject({ isSaving: true });
  });

  it('should finish saving', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
    dateSpy.mockReturnValue(1);

    expect(
      surveyEditorSlice.reducer(
        undefined,
        surveyEditorSlice.actions.savingFinished({
          error: false,
          isFailedConnection: true,
        })
      )
    ).toMatchObject({
      savedOn: 1,
      isSaving: false,
      isFailedConnection: true,
    });
  });

  it('should set survey', () => {
    const survey = {
      studyId: 'study-id',
      id: 'id',
      revisionId: 0,
      title: 'test-title',
      description: 'test-description',
      questions: [],
    };
    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.setSurvey(survey))
    ).toMatchObject({ survey });
  });

  it('should set errors', () => {
    const surveyErrors: SurveyErrors = {
      title: { empty: true },
      questions: [
        {
          id: 'id',
          title: { empty: true },
        },
      ],
    };

    expect(
      surveyEditorSlice.reducer(undefined, surveyEditorSlice.actions.setSurveyErrors(surveyErrors))
    ).toMatchObject({ surveyErrors });
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
          savedOn: 1,
          surveyErrors: [],
        } as unknown as SurveyEditorState,
        surveyEditorSlice.actions.clearSurveyTransientState()
      )
    ).toMatchObject({
      lastTouchedOn: undefined,
      savedOn: undefined,
      surveyErrors: undefined,
    });
  });
});

const studyId = 'test-study';

const survey: SurveyItem = {
  studyId: '',
  id: '1',
  revisionId: 0,
  title: 'test-title',
  description: '',
  questions: [
    {
      id: '1',
      title: 'test-title',
      type: 'single',
      description: '',
      optional: true,
      answers: [],
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
        wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
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

  describe('createSurvey', () => {
    it('should create survey', async () => {
      expect(surveyEditorIsCreatingSelector(store.getState())).toBeFalsy();
      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        questions: [],
      });

      dispatch(createSurvey({ studyId }));

      await waitFor(() => surveyEditorIsCreatingSelector(store.getState()));
      await waitFor(() => !surveyEditorIsCreatingSelector(store.getState()));

      const task = mockTasks[mockTasks.length - 1];

      expect(editedSurveySelector(store.getState())).toEqual({
        studyId,
        id: task.id,
        revisionId: task.revisionId,
        title: '',
        description: '',
        questions: expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringContaining('survey'),
          }),
        ]),
      });

      expect({
        lastTouchedOn: surveyEditorLastTouchedSelector(store.getState()),
        savedOn: surveySavedOnSelector(store.getState()),
        surveyErrors: surveyEditorSurveyErrorsSelector(store.getState()),
      }).toEqual({
        lastTouchedOn: undefined,
        savedOn: undefined,
        surveyErrors: undefined,
      });

      await waitFor(() => history.location.pathname !== '/');

      expect(
        matchPath(history.location.pathname, {
          path: Path.TrialManagementEditSurvey,
          exact: true,
        })
      ).not.toBeNull();
    });

    it('should catch error while task creating', async () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation();

      await Api.mock.maskEndpointAsFailure('createTask', async () => {
        await dispatch(createSurvey({ studyId }));
      });

      await waitFor(() => expect(surveyEditorIsCreatingSelector(store.getState())).toBeFalsy());

      expect(errSpy).toHaveBeenCalled();
      expect(currentSnackbarSelector(store.getState()).text).toMatch(CREATE_SURVEY_FAILED_MESSAGE);
    });
  });

  describe('loadSurvey', () => {
    it('should load survey', async () => {
      expect(surveyEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        questions: [],
      });

      const surveyId = '1';
      const onError = jest.fn();

      dispatch(loadSurvey({ studyId, surveyId, onError }));

      await waitFor(() => surveyEditorIsCreatingSelector(store.getState()));
      await waitFor(() => !surveyEditorIsCreatingSelector(store.getState()));

      expect(onError).not.toHaveBeenCalled();
      expect(editedSurveySelector(store.getState())).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          id: surveyId,
          questions: expect.arrayContaining([
            {
              description: expect.any(String),
              id: expect.any(String),
              optional: expect.any(Boolean),
              title: expect.any(String),
              type: expect.any(String),
              answers: expect.arrayContaining([
                {
                  id: expect.stringContaining('survey'),
                  value: expect.any(String),
                },
              ]),
            },
          ]),
          revisionId: 0,
          studyId,
          title: expect.any(String),
        })
      );
    });

    it('should catch error while data loading', async () => {
      expect(surveyEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        questions: [],
      });

      const surveyId = 'broken-survey-id';
      const onError = jest.fn();

      await dispatch(loadSurvey({ studyId, surveyId, onError }));

      await waitFor(() => !surveyEditorIsCreatingSelector(store.getState()));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('openSurveyResults', () => {
    it('should open published survey', async () => {
      hook = setUpSurveyListHook({ studyId });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.data).not.toBeUndefined();
      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        questions: [],
      });

      const surveyId = '2'; // published
      const task = hook.result.current.data?.published.find((t) => t.id === surveyId);
      expectToBeDefined(task);

      dispatch(openSurveyResults({ surveyId }));

      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: task.revisionId,
        title: task.title,
        description: task.description || '',
        questions: [],
      });

      await waitFor(() => history.location.pathname !== '/');

      expect(
        matchPath(history.location.pathname, {
          path: Path.TrialManagementSurveyResults,
          exact: true,
        })
      ).not.toBeNull();

      unsetHook(hook);
    });
  });

  describe('editSurvey', () => {
    it('should open survey editor', async () => {
      hook = setUpSurveyListHook({ studyId });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.data).not.toBeUndefined();
      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        questions: [],
      });

      const surveyId = '1'; // draft
      const task = hook.result.current.data?.drafts.find((t) => t.id === surveyId);
      expectToBeDefined(task);

      dispatch(editSurvey({ studyId, surveyId }));

      expect(editedSurveySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: task.revisionId,
        title: task.title,
        description: task.description || '',
        questions: [],
      });

      await waitFor(() => history.location.pathname !== '/');

      expect(
        matchPath(history.location.pathname, {
          path: Path.TrialManagementEditSurvey,
          exact: true,
        })
      ).not.toBeNull();

      unsetHook(hook);
    });
  });

  describe('saveIfRequired', () => {
    it('should save survey', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(surveyEditorSlice.actions.updateLastTouched());

      const lastTouched = surveyEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      dispatch(saveSurveyIfRequired({}));

      expect(surveyEditorIsSavingSelector(store.getState())).toBeTruthy();

      await waitFor(() => surveyEditorIsSavingSelector(store.getState()));
      await waitFor(() => !surveyEditorIsSavingSelector(store.getState()));

      expect(surveyEditorIsSavingSelector(store.getState())).toBeFalsy();
      expect(surveySavedOnSelector(store.getState())).toEqual(expect.any(Number));
    });

    it('should skip saving survey if there is no changes', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));

      dispatch(surveyEditorSlice.actions.updateLastTouched());
      const lastTouched = surveyEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      jest
        .spyOn(Date, 'now')
        .mockImplementation()
        .mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveSurveyIfRequired({}));

      const firstTs = surveySavedOnSelector(store.getState());
      expect(firstTs).toEqual(expect.any(Number));

      await dispatch(saveSurveyIfRequired({}));

      expect(surveySavedOnSelector(store.getState())).toEqual(firstTs);
    });

    it('should save survey if there are changes to it', async () => {
      // initial survey
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(surveyEditorSlice.actions.updateLastTouched());

      const lastTouched = surveyEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveSurveyIfRequired({}));

      const firstTs = surveySavedOnSelector(store.getState());
      expectToBeDefined(firstTs);
      expect(firstTs).toEqual(expect.any(Number));

      // update survey
      dispatch(
        surveyEditorSlice.actions.setSurvey({
          ...survey,
          title: 'updated-test-title',
        })
      );

      dateSpy.mockReturnValue(firstTs);
      dispatch(surveyEditorSlice.actions.updateLastTouched());
      dateSpy.mockReturnValue(firstTs + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveSurveyIfRequired({}));

      expect(surveySavedOnSelector(store.getState())).not.toEqual(firstTs);
    });

    it('should force save survey', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(surveyEditorSlice.actions.updateLastTouched());

      const lastTouched = surveyEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveSurveyIfRequired({}));

      const firstTs = surveySavedOnSelector(store.getState());
      expectToBeDefined(firstTs);
      expect(firstTs).toEqual(expect.any(Number));

      dateSpy.mockReturnValue(firstTs);
      dispatch(surveyEditorSlice.actions.updateLastTouched());
      dateSpy.mockReturnValue(firstTs + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveSurveyIfRequired({ force: true }));

      expect(surveySavedOnSelector(store.getState())).not.toEqual(firstTs);
    });

    it('should catch invalid survey while saving', async () => {
      const invalidSurvey: SurveyItem = {
        ...survey,
        title: '', // invalid
        questions: [
          {
            ...survey.questions[0],
            title: '', // invalid
          },
        ],
      };

      dispatch(surveyEditorSlice.actions.setSurvey(invalidSurvey));
      dispatch(surveyEditorSlice.actions.updateLastTouched());

      await dispatch(saveSurveyIfRequired({ force: true }));

      expect(surveySavedOnSelector(store.getState())).toBeUndefined();
    });

    it('should catch error while request', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(surveyEditorSlice.actions.updateLastTouched());

      await Api.mock.maskEndpointAsFailure('updateTask', async () => {
        await dispatch(saveSurveyIfRequired({ force: true }));
      });

      expect(surveyEditorIsFailedConnectionSelector(store.getState())).toBeTruthy();
    });
  });

  describe('autoSaveIfRequired', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should automatic save survey', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));

      const lastTouched = Date.now();
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched);
      dispatch(surveyEditorSlice.actions.updateLastTouched());

      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL * 2);
      dispatch(autoSaveIfRequired());

      jest.runAllTimers();

      await waitFor(() => expect(surveySavedOnSelector(store.getState())).not.toBeUndefined());

      expect(surveySavedOnSelector(store.getState())).toEqual(expect.any(Number));
    });
  });
});

describe('emptyQuestion', () => {
  it('should create empty question', () => {
    expect(emptyQuestion()).toEqual(
      expect.objectContaining({
        id: expect.stringContaining('survey'),
        type: 'single',
        title: '',
        description: '',
        optional: false,
        answers: [
          { id: expect.stringContaining('survey'), value: '' },
          { id: expect.stringContaining('survey'), value: '' },
        ],
      })
    );
  });
});

describe('surveyQuestionFromApi', () => {
  it('should convert survey question with checkbox content type', () => {
    expect(
      surveyQuestionFromApi({
        name: 'test-name',
        sequence: 0,
        type: 'QUESTION',
        contents: {
          title: 'title',
          type: 'CHOICE',
          required: true,
          properties: {
            tag: 'CHECKBOX',
            options: [
              {
                value: 'test-value',
              },
            ],
          },
        },
      })
    ).toEqual({
      answers: [
        {
          id: expect.stringContaining('survey'),
          value: 'test-value',
        },
      ],
      description: '',
      id: 'test-name',
      optional: false,
      title: 'title',
      type: 'multiple',
    });
  });

  it('should convert survey question with radio content type', () => {
    expect(
      surveyQuestionFromApi({
        name: 'test-name',
        sequence: 0,
        type: 'QUESTION',
        contents: {
          title: 'title',
          type: 'CHOICE',
          required: true,
          properties: {
            tag: 'RADIO',
            options: [
              {
                value: 'test-value',
              },
            ],
          },
        },
      })
    ).toEqual({
      answers: [
        {
          id: expect.stringContaining('survey'),
          value: 'test-value',
        },
      ],
      description: '',
      id: 'test-name',
      optional: false,
      title: 'title',
      type: 'single',
    });
  });

  it('should convert survey question with slider content type', () => {
    expect(
      surveyQuestionFromApi({
        name: 'test-name',
        sequence: 0,
        type: 'QUESTION',
        contents: {
          title: 'title',
          type: 'SCALE',
          required: true,
          properties: {
            tag: 'SLIDER',
            lowLabel: 'lowLabel',
            low: 0,
            highLabel: 'highLabel',
            high: 1,
          },
        },
      })
    ).toEqual({
      answers: [
        {
          id: 'low',
          label: 'lowLabel',
          value: 0,
        },
        {
          id: 'high',
          label: 'highLabel',
          value: 1,
        },
      ],
      description: '',
      id: 'test-name',
      optional: false,
      title: 'title',
      type: 'slider',
    });
  });

  it('should convert survey with unknown question type', () => {
    expect(surveyQuestionFromApi({ type: 'ROW' } as TaskItem)).toBeUndefined();
  });

  it('should convert survey question with unknown content type', () => {
    expect(
      surveyQuestionFromApi({
        name: 'test-name',
        sequence: 0,
        type: 'QUESTION',
        contents: {
          title: 'title',
          type: 'TEXT',
          required: true,
        },
      })
    ).toBeUndefined();
  });
});

describe('surveyQuestionListFromApi', () => {
  it('should convert survey questions list', () => {
    expect(
      surveyQuestionListFromApi([
        {
          name: 'test-name',
          sequence: 0,
          type: 'QUESTION',
          contents: {
            title: 'title',
            type: 'CHOICE',
            required: true,
            properties: {
              tag: 'CHECKBOX',
              options: [
                {
                  value: 'test-value',
                },
              ],
            },
          },
        },
        {
          type: 'ROW',
        } as TaskItem,
      ])
    ).toEqual([
      {
        answers: [
          {
            id: expect.stringContaining('survey'),
            value: 'test-value',
          },
        ],
        description: '',
        id: 'test-name',
        optional: false,
        title: 'title',
        type: 'multiple',
      },
    ]);
  });
});

describe('surveyFromApi', () => {
  it('should convert survey', () => {
    const task = findMockTaskById('1');
    expectToBeDefined(task);
    expect(surveyFromApi(studyId, task)).toEqual({
      description: '',
      id: '1',
      questions: [
        {
          answers: [],
          description: '',
          id: '1',
          optional: true,
          title: 'test-title',
          type: 'single',
        },
      ],
      revisionId: 0,
      studyId: 'test-study',
      title: 'test-title',
    });
  });
});

describe('surveyUpdateToApi', () => {
  it('should convert survey to radio question type', () => {
    expect(
      surveyUpdateToApi({
        description: '',
        id: '1',
        questions: [
          {
            answers: [],
            description: '',
            id: '1',
            optional: true,
            title: 'test-title',
            type: 'single',
          },
        ],
        revisionId: 0,
        studyId: 'test-study',
        title: 'test-title',
      })
    ).toEqual({
      title: 'test-title',
      description: '',
      items: [
        {
          contents: {
            explanation: '',
            properties: {
              options: [],
              tag: 'RADIO',
            },
            required: false,
            title: 'test-title',
            type: 'CHOICE',
          },
          name: '1',
          sequence: 0,
          type: 'QUESTION',
        },
      ],
    });
  });

  it('should convert survey to checkbox question type', () => {
    expect(
      surveyUpdateToApi({
        description: '',
        id: '1',
        questions: [
          {
            answers: [],
            description: '',
            id: '1',
            optional: true,
            title: 'test-title',
            type: 'multiple',
          },
        ],
        revisionId: 0,
        studyId: 'test-study',
        title: 'test-title',
      })
    ).toEqual({
      title: 'test-title',
      description: '',
      items: [
        {
          contents: {
            explanation: '',
            properties: {
              options: [],
              tag: 'CHECKBOX',
            },
            required: false,
            title: 'test-title',
            type: 'CHOICE',
          },
          name: '1',
          sequence: 0,
          type: 'QUESTION',
        },
      ],
    });
  });

  it('should convert survey to slider question type', () => {
    expect(
      surveyUpdateToApi({
        description: '',
        id: '1',
        questions: [
          {
            answers: [
              {
                id: 'low',
                label: 'lowLabel',
                value: 0,
              },
              {
                id: 'high',
                label: 'highLabel',
                value: 1,
              },
            ],
            description: '',
            id: 'test-name',
            optional: false,
            title: 'title',
            type: 'slider',
          },
        ],
        revisionId: 0,
        studyId: 'test-study',
        title: 'test-title',
      })
    ).toEqual({
      title: 'test-title',
      description: '',
      items: [
        {
          contents: {
            explanation: '',
            properties: {
              high: 1,
              highLabel: 'highLabel',
              low: 0,
              lowLabel: 'lowLabel',
              tag: 'SLIDER',
            },
            required: true,
            title: 'title',
            type: 'SCALE',
          },
          name: 'test-name',
          sequence: 0,
          type: 'QUESTION',
        },
      ],
    });
  });

  it('should convert survey to unknown question type', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    expect(
      surveyUpdateToApi({
        title: 'test-title',
        description: '',
        id: '1',
        questions: [
          {
            type: 'unknown-type',
          },
        ],
        revisionId: 0,
        studyId: 'test-study',
      } as unknown as SurveyItem)
    ).toEqual({
      title: 'test-title',
      description: '',
      items: [],
    });

    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});

describe('getSurveyErrors', () => {
  it('should catch errors', () => {
    const invalidSurvey: SurveyItem = {
      ...survey,
      title: '', // invalid
      questions: [
        {
          ...survey.questions[0],
          title: '', // invalid
        },
      ],
    };

    expect(
      getSurveyErrors({
        survey: invalidSurvey,
      })
    ).toEqual({
      title: {
        empty: true,
      },
      questions: [
        {
          id: survey.questions[0].id,
          title: {
            empty: true,
          },
        },
      ],
    });
  });

  it('should find difference of errors', () => {
    expect(
      getSurveyErrors({
        survey,
        currentErrors: {
          title: {
            empty: true,
          },
          questions: [
            {
              id: survey.questions[0].id,
              title: {
                empty: true,
              },
            },
          ],
        },
      })
    ).toEqual({
      title: {
        empty: false,
      },
      questions: [
        {
          id: survey.questions[0].id,
          title: {
            empty: false,
          },
        },
      ],
    });
  });
});

describe('hasSurveyTitleErrors', () => {
  it('should catch error', () => {
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
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('hasSurveyQuestionErrors', () => {
  it('should catch error', () => {
    expect(
      hasSurveyQuestionErrors({
        id: survey.questions[0].id,
        title: {
          empty: true,
        },
      })
    ).toBeTruthy();
  });
});

describe('hasSomeSurveyErrors', () => {
  it('should catch error', () => {
    expect(
      hasSomeSurveyErrors({
        title: {
          empty: true,
        },
        questions: [
          {
            id: survey.questions[0].id,
            title: {
              empty: false,
            },
          },
        ],
      })
    ).toBeTruthy();

    expect(
      hasSomeSurveyErrors({
        title: {
          empty: false,
        },
        questions: [
          {
            id: survey.questions[0].id,
            title: {
              empty: true,
            },
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('newId', () => {
  it('should create unique id', () => {
    expect(newId()).toMatch('survey');
    expect(newId()).not.toBe(newId());
  });
});

describe('useSurveyEditor', () => {
  const setUpSurveyEditorHook = () =>
    renderHook(() => useSurveyEditor(), {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
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

  describe('loadSurvey', () => {
    it('should load survey', async () => {
      hook = setUpSurveyEditorHook();

      const surveyId = '1';
      const onError = jest.fn();

      act(() => {
        hook.result.current.loadSurvey({
          studyId,
          surveyId,
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      expect(onError).not.toHaveBeenCalled();
      expect(hook.result.current.survey).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          revisionId: expect.any(Number),
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

    it('should reload survey', async () => {
      hook = setUpSurveyEditorHook();

      const surveyId = '1';
      const onError = jest.fn();

      act(() => {
        hook.result.current.loadSurvey({
          studyId,
          surveyId,
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      act(() => {
        hook.result.current.loadSurvey({
          studyId,
          surveyId,
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeFalsy();

      act(() => {
        hook.result.current.loadSurvey({
          studyId: 'other-study',
          surveyId: '2',
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();
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
          revisionId: expect.any(Number),
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
        hook.result.current.addQuestion();
      });

      expect(hook.result.current.survey.questions).toHaveLength(length + 1);
    });
  });

  describe('copyQuestion', () => {
    it('should copy question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const { length } = hook.result.current.survey.questions;
      const question = hook.result.current.survey.questions[0];

      act(() => {
        hook.result.current.copyQuestion(question);
      });

      expect(hook.result.current.survey.questions).toHaveLength(length + 1);
      expect(hook.result.current.survey.questions[length]).toEqual({
        ...question,
        id: expect.any(String),
      });
      expect(currentSnackbarSelector(store.getState()).text).toEqual(expect.any(String));
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
        hook.result.current.removeQuestion({ id: hook.result.current.survey.questions[0].id });
      });

      expect(hook.result.current.survey.questions).toHaveLength(length - 1);
    });
  });

  describe('validateSurvey', () => {
    it('should catch errors', () => {
      hook = setUpSurveyEditorHook();

      const invalidSurvey: SurveyItem = {
        ...survey,
        title: '', // invalid
        questions: [
          {
            ...survey.questions[0],
            title: '', // invalid
          },
        ],
      };

      const error = {
        title: {
          empty: true,
        },
        questions: [
          {
            id: survey.questions[0].id,
            title: {
              empty: true,
            },
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

  describe('updateQuestion', () => {
    it('should update question', () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      const testedQuestion = hook.result.current.survey.questions[0];
      const updates = { title: 'updated-title' };

      act(() => {
        hook.result.current.updateQuestion({ id: testedQuestion.id, ...updates });
      });

      expect(hook.result.current.survey.questions[0]).toEqual({ ...testedQuestion, ...updates });
    });
  });

  describe('saveSurvey', () => {
    it('should save survey', async () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      expect(hook.result.current.savedOn).toBeUndefined();

      act(() => {
        hook.result.current.saveSurvey();
      });

      expect(hook.result.current.isSaving).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isSaving).toBeFalsy());

      expect(hook.result.current.savedOn).toEqual(expect.any(Number));
      expect(hook.result.current.isFailedConnection).toBeFalsy();
    });

    it('should catch error while survey saving', async () => {
      hook = setUpSurveyEditorHook();

      act(() => {
        hook.result.current.setSurvey(survey);
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeUndefined();

      await Api.mock.maskEndpointAsFailure('updateTask', async () => {
        await act(() => hook.result.current.saveSurvey());
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeTruthy();
    });
  });
});
