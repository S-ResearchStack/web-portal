import React from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor, act } from '@testing-library/react';
import { makeHistory } from 'src/modules/navigation/store';
import { ActivityResponse, ActivityTaskType } from 'src/modules/api';
import { expectToBeDefined } from 'src/common/utils/testing';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import {
  activityFromApi,
  activityUpdateToApi,
  ActivityTaskItem,
  activityItemListFromApi,
} from './activityConversion';
import {
  generateActivity,
  editedActivitySelector,
  getActivityErrors,
  hasSomeActivityErrors,
  hasActivityItemsErrors,
  initialState as activityEditorInitialState,
  activityEditorIsLoadingSelector,
  activityEditorSlice,
  ActivityEditorState,
  ActivityErrors,
  useActivityEditor,
  hasActivityDescriptionErrors,
} from './activityEditor.slice';
import { findMockTaskById } from '../activitiesList.slice';

const activity: ActivityTaskItem = {
  studyId: '',
  id: '1',
  description: 'test-descr',
  type: 'TAPPING_SPEED',
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
  it('[NEGATIVE] should make empty state', () => {
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


  it('should set activity', () => {
    expect(
      activityEditorSlice.reducer(undefined, activityEditorSlice.actions.setActivityTask(activity))
    ).toMatchObject({ data: activity });
  });

  it('[NEGATIVE] should set errors', () => {
    const activityErrors: ActivityErrors = {
      title: { empty: true },
      description: { empty: true },
      items: [
        {
          id: 'test',
          value: {
            completionTitle: { empty: true },
            completionDescription: { empty: true },
            transcription: { empty: true },
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
          errors: [],
        } as unknown as ActivityEditorState,
        activityEditorSlice.actions.clearActivityTransientState()
      )
    ).toMatchObject({
      lastTouchedOn: undefined,
      errors: undefined,
    });
  });

  it('should reset state', () => {
    expect(
      activityEditorSlice.reducer(
        {
          isLoading: true,
          lastTouchedOn: 1,
          errors: [],
        } as unknown as ActivityEditorState,
        activityEditorSlice.actions.reset()
      )
    ).toMatchObject({
      isLoading: false,
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
  describe('generateActivity', () => {
    it('should generate activity', async () => {
      expect(activityEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedActivitySelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        title: '',
        type: '',
        description: '',
        items: [],
      });

      dispatch(generateActivity({ studyId, activityType: 'TAPPING_SPEED' }));

      await waitFor(() => activityEditorIsLoadingSelector(store.getState()));
      await waitFor(() => !activityEditorIsLoadingSelector(store.getState()));

      expect(editedActivitySelector(store.getState())).toEqual(
        expect.objectContaining({
          id: '',
          studyId,
          title: expect.any(String),
          type: 'TAPPING_SPEED',
          description: expect.any(String),
          items: expect.any(Object),
        })
      );
    });
  });
});

describe('activityFromApi', () => {
  it('should convert activity', () => {
    const task = findMockTaskById('1');
    expectToBeDefined(task);
    expect(activityFromApi(studyId, task)).toEqual({
      id: '1',
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
      title: activity.title,
      description: activity.description,
      task: expect.any(Object),
    });
  });
});

describe('getActivityErrors', () => {
  it('[NEGATIVE] should catch errors', () => {
    const invalidActivity: ActivityTaskItem = {
      ...activity,
      description: '', // invalid
    };

    expect(
      getActivityErrors({
        item: invalidActivity,
      })
    ).toEqual({
      title: { empty: false },
      description: { empty: true },
      items: [
        {
          id: activity.items[0].children[0].id,
          value: {
            transcription: { empty: false },
            completionTitle: { empty: false },
            completionDescription: { empty: false },
          },
        },
      ],
    });
  });

  it('[NEGATIVE] should find difference of errors', () => {
    expect(
      getActivityErrors({
        item: activity,
        currentErrors: {
          title: { empty: true },
          description: { empty: true },
          items: [
            {
              id: activity.items[0].children[0].id,
              value: {
                transcription: { empty: true },
                completionTitle: { empty: true },
                completionDescription: { empty: true },
              },
            },
          ],
        },
      })
    ).toEqual({
      title: { empty: false },
      description: { empty: false },
      items: [
        {
          id: activity.items[0].children[0].id,
          value: {
            transcription: { empty: false },
            completionTitle: { empty: false },
            completionDescription: { empty: false },
          },
        },
      ],
    });
  });
});

describe('hasActivityDescriptionErrors', () => {
  it('[NEGATIVE] should catch error', () => {
    expect(
      hasActivityDescriptionErrors({
        title: { empty: true },
        description: { empty: true },
        items: [
          {
            id: activity.items[0].id,
            value: {
              transcription: { empty: false },
              completionTitle: { empty: false },
              completionDescription: { empty: false },
            },
          },
        ],
      })
    ).toBeTruthy();
  });
});

describe('hasActivityItemsErrors', () => {
  it('[NEGATIVE] should catch error', () => {
    expect(
      hasActivityItemsErrors({
        id: activity.items[0].id,
        value: {
          transcription: { empty: true },
          completionTitle: { empty: true },
          completionDescription: { empty: true },
        },
      })
    ).toBeTruthy();
  });
});

describe('hasSomeActivityErrors', () => {
  it('[NEGATIVE] should catch error', () => {
    expect(
      hasSomeActivityErrors({
        title: { empty: true },
        description: { empty: true },
        items: [
          {
            id: activity.items[0].id,
            value: {
              transcription: { empty: false },
              completionTitle: { empty: false },
              completionDescription: { empty: false },
            },
          },
        ],
      })
    ).toBeTruthy();

    expect(
      hasSomeActivityErrors({
        title: { empty: false },
        description: { empty: false },
        items: [
          {
            id: activity.items[0].id,
            value: {
              transcription: { empty: true },
              completionTitle: { empty: true },
              completionDescription: { empty: true },
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
    it('[NEGATIVE] should catch errors', () => {
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
        title: { empty: false },
        description: { empty: true },
        items: [
          {
            id: activity.items[0].children[0].id,
            value: {
              transcription: { empty: true },
              completionTitle: { empty: true },
              completionDescription: { empty: true }
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

  describe('get activity items by type', () => {
    it('should get items', async () => {
      (
        [
          'TAPPING_SPEED',
          'TAPPING_SPEED',
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
          'ECG_MEASUREMENT',
        ] as ActivityTaskType[]
      )
        .map(
          (type) =>
          ({
            task: {
              type,
              completionTitle: '',
              completionDescription: '',
              required: true,
              properties: {
                transcription: '',
              },
            }
          } as ActivityResponse)
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
      expect(activityItemListFromApi({} as ActivityResponse)).toEqual(
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
