import React from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor, act } from '@testing-library/react';
import { matchPath } from 'react-router-dom';
import { makeHistory, Path } from 'src/modules/navigation/store';
import Api, { ActivityTask, ActivityTaskType } from 'src/modules/api';
import { expectToBeDefined } from 'src/common/utils/testing';
import { maskEndpointAsFailure } from 'src/modules/api/mock';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import {
  AUTOSAVE_DEBOUNCE_INTERVAL,
  autoSaveIfRequired,
  editedActivitySelector,
  editActivity,
  getActivityErrors,
  hasSomeActivityErrors,
  hasActivityItemsErrors,
  loadActivity,
  openActivityResults,
  saveActivityIfRequired,
  initialState as activityEditorInitialState,
  activityEditorIsFailedConnectionSelector,
  activityEditorIsLoadingSelector,
  activityEditorIsSavingSelector,
  activityEditorLastTouchedSelector,
  activityEditorSlice,
  ActivityEditorState,
  ActivityErrors,
  activitySavedOnSelector,
  useActivityEditor,
  hasActivityDescriptionErrors,
} from './activityEditor.slice';
import {
  activityFromApi,
  activityUpdateToApi,
  ActivityTaskItem,
  activityItemListFromApi,
} from './activityConversion';
import { createActivityTask, createActivitySelector } from '../createActivityTask.slice';
import { activityDescriptionByType, activityTypeToTitle } from '../activities.utils';

import {
  findMockTaskById,
  mockTasks,
  ActivitiesListSliceFetchArgs,
  useActivitiesListData,
} from '../activitiesList.slice';

const activity: ActivityTaskItem = {
  studyId: '',
  id: '1',
  revisionId: 0,
  description: 'test-descr',
  type: 'GAIT_AND_BALANCE',
  title: 'test-title',
  items: [
    {
      id: 'section-id',
      children: [
        {
          id: '1',
          title: 'test-title',
          description: '',
          value: {
            completionTitle: 'test-completionTitle',
            completionDescription: 'test-completionDescription',
            transcription: 'test-transcription',
          },
        },
      ],
    },
  ],
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('activityEditorSlice', () => {
  it('should make empty state', () => {
    expect(activityEditorSlice.reducer(undefined, { type: '' })).toEqual(
      activityEditorInitialState
    );
  });

  it('should support activity loading successful lifecycle', () => {
    const loadingState = activityEditorSlice.reducer(
      undefined,
      activityEditorSlice.actions.loadingStarted()
    );
    expect(loadingState).toMatchObject({ isLoading: true });
    expect(
      activityEditorSlice.reducer(loadingState, activityEditorSlice.actions.loadingFinished())
    ).toMatchObject({ isLoading: false });
  });

  it('should support activity saving successful lifecycle', () => {
    const savingState = activityEditorSlice.reducer(
      undefined,
      activityEditorSlice.actions.savingStarted()
    );
    expect(savingState).toMatchObject({ isSaving: true });

    const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
    dateSpy.mockReturnValue(1);

    expect(
      activityEditorSlice.reducer(
        savingState,
        activityEditorSlice.actions.savingFinished({
          error: false,
          isFailedConnection: true,
        })
      )
    ).toMatchObject({
      savedOn: 1,
      isSaving: false,
      isFailedConnection: true,
    });

    dateSpy.mockRestore();
  });

  it('should set activity', () => {
    expect(
      activityEditorSlice.reducer(undefined, activityEditorSlice.actions.setActivityTask(activity))
    ).toMatchObject({ data: activity });
  });

  it('should set errors', () => {
    const activityErrors: ActivityErrors = {
      description: { empty: true },
      items: [
        {
          id: 'test',
          value: {
            completionTitle: {
              empty: true,
            },
            transcription: {
              empty: true,
            },
          },
        },
      ],
    };

    expect(
      activityEditorSlice.reducer(
        undefined,
        activityEditorSlice.actions.setActivityErrors(activityErrors)
      )
    ).toMatchObject({ errors: activityErrors });
  });

  it('should touch', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
    dateSpy.mockReturnValue(1);

    expect(
      activityEditorSlice.reducer(undefined, activityEditorSlice.actions.updateLastTouched())
    ).toMatchObject({ lastTouchedOn: 1 });
  });

  it('should clear transient state', () => {
    expect(
      activityEditorSlice.reducer(
        {
          lastTouchedOn: 1,
          savedOn: 1,
          activityErrors: [],
        } as unknown as ActivityEditorState,
        activityEditorSlice.actions.clearActivityTransientState()
      )
    ).toMatchObject({
      lastTouchedOn: undefined,
      savedOn: undefined,
      activityErrors: [],
    });
  });
});

const studyId = 'test-study';

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;
});

describe('actions', () => {
  const setUpActivityListHook = (args: ActivitiesListSliceFetchArgs | false) =>
    renderHook(
      (fetchArgs: ActivitiesListSliceFetchArgs) =>
        useActivitiesListData({ fetchArgs: fetchArgs || args }),
      {
        wrapper: ({ children }: React.PropsWithChildren) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );

  let hook: ReturnType<typeof setUpActivityListHook>;

  const unsetHook = (h: ReturnType<typeof setUpActivityListHook>) => {
    act(() => {
      h.result.current.reset();
      h.unmount();
    });
  };

  describe('createActivityTask', () => {
    it('should create activity', async () => {
      expect(createActivitySelector(store.getState()).isSending).toBeFalsy();
      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        type: '',
        items: [],
      });

      await dispatch(createActivityTask({ studyId, type: 'TAPPING_SPEED' }));

      await waitFor(() => createActivitySelector(store.getState()));
      await waitFor(() => !createActivitySelector(store.getState()));

      const task = mockTasks[0];
      const { type } = task.items[0].contents;

      expect(editedActivitySelector(store.getState())).toEqual({
        studyId,
        id: expect.any(String),
        revisionId: task.revisionId,
        title: activityTypeToTitle(type),
        type,
        description: activityDescriptionByType(type),
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            children: activityItemListFromApi(task),
          }),
        ]),
      });
    });

    it('[NEGATIVE] should catch error while task creating', async () => {
      await Api.mock.maskEndpointAsFailure('createActivityTask', async () => {
        await dispatch(createActivityTask({ studyId, type: 'GAIT_AND_BALANCE' }));
      });

      await waitFor(() => expect(createActivitySelector(store.getState()).isSending).toBeFalsy());
    });

    it('[NEGATIVE] should create task with broken data', async () => {
      await Api.mock.maskEndpointAsSuccess(
        'createActivityTask',
        async () => {
          await dispatch(createActivityTask({ studyId, type: 'GAIT_AND_BALANCE' }));
        },
        { response: null }
      );

      await waitFor(() => expect(createActivitySelector(store.getState()).isSending).toBeFalsy());
    });
  });

  describe('loadActivity', () => {
    it('should load activity', async () => {
      expect(activityEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        type: '',
        description: '',
        items: [],
      });

      const activityId = '1';
      const onError = jest.fn();

      dispatch(loadActivity({ studyId, activityId, onError }));

      await waitFor(() => createActivitySelector(store.getState()));
      await waitFor(() => !createActivitySelector(store.getState()));

      expect(onError).not.toHaveBeenCalled();
      expect(editedActivitySelector(store.getState())).toEqual(
        expect.objectContaining({
          id: activityId,
          revisionId: 0,
          studyId,
          title: expect.any(String),
        })
      );
    });

    it('[NEGATIVE] should catch error while data loading', async () => {
      expect(activityEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        type: '',
        description: '',
        items: [],
      });

      const activityId = 'broken-activity-id';
      const onError = jest.fn();

      await dispatch(loadActivity({ studyId, activityId, onError }));

      await waitFor(() => !createActivitySelector(store.getState()));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('openActivityResults', () => {
    it('should open published activity', async () => {
      hook = setUpActivityListHook({ studyId });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.data).not.toBeUndefined();
      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        items: [],
        type: '',
      });

      const activityId = '14'; // published
      const task = hook.result.current.data?.published.find((t) => t.id === activityId);
      expectToBeDefined(task);

      dispatch(openActivityResults({ activityId }));

      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: task.revisionId,
        title: task.title,
        items: [],
        description: task.description,
        type: task.type,
      });

      await waitFor(() => history.location.pathname !== '/');

      expect(
        matchPath(history.location.pathname, {
          path: Path.StudyManagementActivityResults,
          exact: true,
        })
      ).not.toBeNull();

      unsetHook(hook);
    });
  });

  describe('editActivity', () => {
    it('should open activity editor', async () => {
      hook = setUpActivityListHook({ studyId });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.data).not.toBeUndefined();
      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        title: '',
        description: '',
        type: '',
        items: [],
      });

      const activityId = '1'; // draft
      const task = hook.result.current.data?.drafts.find((t) => t.id === activityId);
      expectToBeDefined(task);

      dispatch(editActivity({ studyId, activityId }));

      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: task.revisionId,
        title: task.title,
        description: task.description,
        type: task.type,
        items: [],
      });

      await waitFor(() => history.location.pathname !== '/');

      expect(
        matchPath(history.location.pathname, {
          path: Path.StudyManagementEditActivity,
          exact: true,
        })
      ).not.toBeNull();

      unsetHook(hook);
    });
  });

  describe('saveIfRequired', () => {
    it('should save activity', async () => {
      dispatch(activityEditorSlice.actions.setActivityTask(activity));
      dispatch(activityEditorSlice.actions.updateLastTouched());

      const lastTouched = activityEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      dispatch(saveActivityIfRequired({}));

      expect(activityEditorIsSavingSelector(store.getState())).toBeTruthy();

      await waitFor(() => activityEditorIsSavingSelector(store.getState()));
      await waitFor(() => !activityEditorIsSavingSelector(store.getState()));

      expect(activityEditorIsSavingSelector(store.getState())).toBeFalsy();
      expect(activitySavedOnSelector(store.getState())).toEqual(expect.any(Number));
    });

    it('should skip saving activity if there is no changes', async () => {
      dispatch(activityEditorSlice.actions.setActivityTask(activity));

      dispatch(activityEditorSlice.actions.updateLastTouched());
      const lastTouched = activityEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      jest
        .spyOn(Date, 'now')
        .mockImplementation()
        .mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveActivityIfRequired({}));

      const firstTs = activitySavedOnSelector(store.getState());
      expect(firstTs).toEqual(expect.any(Number));

      await dispatch(saveActivityIfRequired({}));

      expect(activitySavedOnSelector(store.getState())).toEqual(firstTs);
    });

    it('should save activity if there are changes to it', async () => {
      // initial activity
      dispatch(activityEditorSlice.actions.setActivityTask(activity));
      dispatch(activityEditorSlice.actions.updateLastTouched());

      const lastTouched = activityEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveActivityIfRequired({}));

      const firstTs = activitySavedOnSelector(store.getState());
      expectToBeDefined(firstTs);
      expect(firstTs).toEqual(expect.any(Number));

      // update activity
      dispatch(
        activityEditorSlice.actions.setActivityTask({
          ...activity,
          title: 'updated-test-title',
        })
      );

      dateSpy.mockReturnValue(firstTs);
      dispatch(activityEditorSlice.actions.updateLastTouched());
      dateSpy.mockReturnValue(firstTs + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveActivityIfRequired({}));

      expect(activitySavedOnSelector(store.getState())).not.toEqual(firstTs);
    });

    it('should force save activity', async () => {
      dispatch(activityEditorSlice.actions.setActivityTask(activity));
      dispatch(activityEditorSlice.actions.updateLastTouched());

      const lastTouched = activityEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveActivityIfRequired({}));

      const firstTs = activitySavedOnSelector(store.getState());
      expectToBeDefined(firstTs);
      expect(firstTs).toEqual(expect.any(Number));

      dateSpy.mockReturnValue(firstTs);
      dispatch(activityEditorSlice.actions.updateLastTouched());
      dateSpy.mockReturnValue(firstTs + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      await dispatch(saveActivityIfRequired({ force: true }));

      expect(activitySavedOnSelector(store.getState())).not.toEqual(firstTs);
    });

    it('[NEGATIVE] should catch invalid activity while saving', async () => {
      const invalidActivity: ActivityTaskItem = {
        ...activity,
        description: '', // invalid
      };

      dispatch(activityEditorSlice.actions.setActivityTask(invalidActivity));
      dispatch(activityEditorSlice.actions.updateLastTouched());

      await dispatch(saveActivityIfRequired({ force: true }));

      expect(activitySavedOnSelector(store.getState())).toBeNumber();
    });

    it('[NEGATIVE] should catch error while request', async () => {
      dispatch(activityEditorSlice.actions.setActivityTask(activity));
      dispatch(activityEditorSlice.actions.updateLastTouched());

      await Api.mock.maskEndpointAsFailure('updateActivityTask', async () => {
        await dispatch(saveActivityIfRequired({ force: true }));
      });

      expect(activityEditorIsFailedConnectionSelector(store.getState())).toBeTruthy();
    });
  });

  describe('autoSaveIfRequired', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should automatic save activity', async () => {
      dispatch(activityEditorSlice.actions.setActivityTask(activity));

      const lastTouched = Date.now();
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched);
      dispatch(activityEditorSlice.actions.updateLastTouched());

      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL * 2);
      dispatch(autoSaveIfRequired());

      jest.runAllTimers();

      await waitFor(() => expect(activitySavedOnSelector(store.getState())).not.toBeUndefined());

      expect(activitySavedOnSelector(store.getState())).toEqual(expect.any(Number));
    });
  });
});

describe('activityFromApi', () => {
  it('should convert activity', () => {
    const task = findMockTaskById('1');
    expectToBeDefined(task);
    expect(activityFromApi(studyId, task)).toEqual({
      id: '1',
      revisionId: 0,
      studyId: 'test-study',
      title: task.title,
      type: 'GAIT_AND_BALANCE',
      description: task.description,
      items: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          children: activityItemListFromApi(task),
        }),
      ]),
    });
  });
});

describe('activityUpdateToApi', () => {
  it('should convert activity for update', () => {
    expect(activityUpdateToApi(activity)).toEqual({
      ...activity,
      type: 'ACTIVITY',
      items: [
        {
          name: 'Activity0',
          sequence: 0,
          type: 'ACTIVITY',
          contents: {
            required: true,
            type: 'GAIT_AND_BALANCE',
            completionDescription: 'test-completionDescription',
            completionTitle: 'test-completionTitle',
            properties: {
              transcription: 'test-transcription',
            },
          },
        },
      ],
    });
  });
});

describe('getActivityErrors', () => {
  it('should catch errors', () => {
    const invalidActivity: ActivityTaskItem = {
      ...activity,
      description: '', // invalid
    };

    expect(
      getActivityErrors({
        item: invalidActivity,
      })
    ).toEqual({
      description: {
        empty: true,
      },
      items: [
        {
          id: activity.items[0].children[0].id,
          value: {
            transcription: { empty: false },
            completionTitle: { empty: false },
          },
        },
      ],
    });
  });

  it('should find difference of errors', () => {
    expect(
      getActivityErrors({
        item: activity,
        currentErrors: {
          description: {
            empty: true,
          },
          items: [
            {
              id: activity.items[0].children[0].id,
              value: {
                transcription: { empty: true },
                completionTitle: { empty: true },
              },
            },
          ],
        },
      })
    ).toEqual({
      description: {
        empty: false,
      },
      items: [
        {
          id: activity.items[0].children[0].id,
          value: {
            transcription: { empty: false },
            completionTitle: { empty: false },
          },
        },
      ],
    });
  });
});

describe('hasActivityDescriptionErrors', () => {
  it('should catch error', () => {
    expect(
      hasActivityDescriptionErrors({
        description: {
          empty: true,
        },
        items: [
          {
            id: activity.items[0].id,
            value: {
              transcription: { empty: false },
              completionTitle: { empty: false },
            },
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('hasActivityItemsErrors', () => {
  it('should catch error', () => {
    expect(
      hasActivityItemsErrors({
        id: activity.items[0].id,
        value: {
          transcription: { empty: true },
          completionTitle: { empty: true },
        },
      })
    ).toBeTruthy();
  });
});

describe('hasSomeActivityErrors', () => {
  it('should catch error', () => {
    expect(
      hasSomeActivityErrors({
        description: {
          empty: true,
        },
        items: [
          {
            id: activity.items[0].id,
            value: {
              transcription: { empty: false },
              completionTitle: { empty: false },
            },
          },
        ],
      })
    ).toBeTruthy();

    expect(
      hasSomeActivityErrors({
        description: {
          empty: false,
        },
        items: [
          {
            id: activity.items[0].id,
            value: {
              transcription: { empty: true },
              completionTitle: { empty: true },
            },
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('useActivityEditor', () => {
  const setUpActivityEditorHook = () =>
    renderHook(() => useActivityEditor(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

  let hook: ReturnType<typeof setUpActivityEditorHook>;

  const unsetHook = (h?: ReturnType<typeof setUpActivityEditorHook>) => {
    act(() => {
      h?.unmount();
    });
  };

  afterEach(() => {
    unsetHook(hook);
  });

  describe('loadActivity', () => {
    it('should load activity', async () => {
      hook = setUpActivityEditorHook();

      const activityId = '1';
      const onError = jest.fn();

      act(() => {
        hook.result.current.loadActivity({
          studyId,
          activityId,
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      expect(onError).not.toHaveBeenCalled();
      expect(hook.result.current.activity).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          revisionId: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          type: expect.any(String),
          items: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  title: expect.any(String),
                  description: expect.any(String),
                }),
              ]),
            }),
          ]),
        })
      );
    });

    it('[NEGATIVE] should load activity with failed response', async () => {
      hook = setUpActivityEditorHook();

      const activityId = '1';
      const error = 'test-error';
      const onError = jest.fn();

      await maskEndpointAsFailure(
        'getActivityTask',
        async () => {
          act(() => {
            hook.result.current.loadActivity({
              studyId,
              activityId,
              onError,
            });
          });

          await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
        },
        { message: error }
      );

      expect(onError).toHaveBeenCalled();
    });

    it('should reload activity', async () => {
      hook = setUpActivityEditorHook();

      const activityId = '1';
      const onError = jest.fn();

      act(() => {
        hook.result.current.loadActivity({
          studyId,
          activityId,
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      act(() => {
        hook.result.current.loadActivity({
          studyId,
          activityId,
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeFalsy();

      act(() => {
        hook.result.current.loadActivity({
          studyId: 'other-study',
          activityId: '2',
          onError,
        });
      });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();
    });

    it('[NEGATIVE] should reload activity with error', async () => {
      hook = setUpActivityEditorHook();

      const activityId = '1';
      const onError = jest.fn();

      act(() => {
        hook.result.current.loadActivity({
          studyId,
          activityId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.activity).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          revisionId: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          type: expect.any(String),
          items: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  title: expect.any(String),
                  description: expect.any(String),
                }),
              ]),
            }),
          ]),
        })
      );

      await maskEndpointAsFailure(
        'getActivityTask',
        async () => {
          act(() => {
            hook.result.current.loadActivity({
              studyId,
              activityId,
              onError,
            });
          });

          await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
        },
        { message: 'error' }
      );

      expect(hook.result.current.activity).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          revisionId: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          type: expect.any(String),
          items: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  title: expect.any(String),
                  description: expect.any(String),
                }),
              ]),
            }),
          ]),
        })
      );
    });
  });

  describe('setActivityTask', () => {
    it('should set activity', () => {
      hook = setUpActivityEditorHook();

      expect(hook.result.current.lastTouchedOn).toBeUndefined();

      act(() => {
        hook.result.current.setActivity(activity);
      });

      expect(hook.result.current.lastTouchedOn).toEqual(expect.any(Number));
      expect(hook.result.current.activity).toEqual(
        expect.objectContaining({
          studyId: expect.any(String),
          id: expect.any(String),
          revisionId: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          type: expect.any(String),
          items: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  title: expect.any(String),
                  description: expect.any(String),
                }),
              ]),
            }),
          ]),
        })
      );
    });
  });

  describe('validateActivity', () => {
    it('should catch errors', () => {
      hook = setUpActivityEditorHook();

      const invalidActivity: ActivityTaskItem = {
        ...activity,
        description: '', // invalid
        items: [
          {
            ...activity.items[0],
            children: [
              {
                ...activity.items[0].children[0],
                value: {
                  transcription: '',
                  completionDescription: '',
                  completionTitle: '',
                },
              },
            ],
          },
        ],
      };

      const error = {
        description: {
          empty: true,
        },
        items: [
          {
            id: activity.items[0].children[0].id,
            value: {
              transcription: {
                empty: true,
              },
              completionTitle: {
                empty: true,
              },
            },
          },
        ],
      };

      expect(hook.result.current.activityErrors).toBeUndefined();

      act(() => {
        hook.result.current.setActivity(invalidActivity);
      });

      act(() => {
        expect(hook.result.current.validateActivity()).toEqual(error);
      });

      expect(hook.result.current.activityErrors).toEqual(error);
    });
  });

  describe('updateActivity', () => {
    it('should update activity', () => {
      hook = setUpActivityEditorHook();

      act(() => {
        hook.result.current.setActivity(activity);
      });

      expect(hook.result.current.activity).toEqual(activity);

      const updates = { id: 'test-id' };
      const updatedActivity = { ...activity, ...updates };

      act(() => {
        hook.result.current.updateActivity(updates);
      });

      expect(hook.result.current.activity).toEqual(updatedActivity);
    });
  });

  describe('saveActivity', () => {
    it('should save activity', async () => {
      hook = setUpActivityEditorHook();

      act(() => {
        hook.result.current.setActivity(activity);
      });

      expect(hook.result.current.savedOn).toBeUndefined();

      act(() => {
        hook.result.current.saveActivity();
      });

      expect(hook.result.current.isSaving).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isSaving).toBeFalsy());

      expect(hook.result.current.savedOn).toEqual(expect.any(Number));
      expect(hook.result.current.isFailedConnection).toBeFalsy();
    });

    it('[NEGATIVE] should catch error while activity saving', async () => {
      hook = setUpActivityEditorHook();

      act(() => {
        hook.result.current.setActivity(activity);
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeUndefined();

      await Api.mock.maskEndpointAsFailure('updateActivityTask', async () => {
        await act(() => hook.result.current.saveActivity());
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeTruthy();
    });
  });

  describe('get activity items by type', () => {
    it('should get items', async () => {
      (
        [
          'TAPPING_SPEED',
          'GAIT_AND_BALANCE',
          'RANGE_OF_MOTION',
          'SUSTAINED_PHONATION',
          'MOBILE_SPIROMETRY',
          'SPEECH_RECOGNITION',
          'GUIDED_BREATHING',
          'STEP_TEST',
          'WALK_TEST',
          'SIT_TO_STAND',
          'REACTION_TIME',
          'STROOP_TEST',
        ] as ActivityTaskType[]
      )
        .map(
          (type) =>
            ({
              items: [
                {
                  contents: {
                    type,
                    completionTitle: '',
                    completionDescription: '',
                    required: true,
                    properties: {
                      transcription: '',
                    },
                  },
                },
              ],
            } as ActivityTask)
        )
        .forEach((t) =>
          expect(activityItemListFromApi(t)).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                title: expect.any(String),
                description: expect.any(String),
              }),
            ])
          )
        );
    });

    it('[NEGATIVE] should get correct value with wrong type', async () => {
      expect(activityItemListFromApi({} as ActivityTask)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
          }),
        ])
      );
    });
  });
});
