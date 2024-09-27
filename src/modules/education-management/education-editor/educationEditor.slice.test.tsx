import React from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor, act } from '@testing-library/react';
import _cloneDeep from 'lodash/cloneDeep';

import { makeHistory } from 'src/modules/navigation/store';

import { expectToBeDefined } from 'src/common/utils/testing';
import { maskEndpointAsFailure } from 'src/modules/api/mock';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import {
  educationEditorSlice,
  EducationItem,
  EducationEditorErrors,
  educationEditorInitialState,
  editedEducationSelector,
  educationEditorIsLoadingSelector,
  educationEditorIsSavingSelector,
  educationEditorLastTouchedSelector,
  educationEditorIsFailedConnectionSelector,
  EducationEditorState,
  hasSomeEducationErrors,
  loadEducationContent,
  saveEducationContent,
  useEducationEditor,
} from './educationEditor.slice';
import API, {
  EducationalContentStatus,
  EducationalContentType,
  ScratchContent,
  TextBlock,
} from 'src/modules/api';

const studyId = 'test-study';
const emptyPublication = {
  studyId: '',
  id: '',
  type: '' as EducationalContentType,
  status: '' as EducationalContentStatus,
  title: '',
  category: '',
  content: [],
};

const testPublication: EducationItem = {
  studyId: studyId,
  id: '1',
  title: 'test-title',
  type: EducationalContentType.SCRATCH,
  status: 'DRAFT',
  category: 'test-category',
  content: [
    {
      id: 'section-id',
      children: [
        {
          id: 'test-image-1',
          description: '',
          coverImage: 'SCRATCH_1',
          blocks: [
            {
              id: "education259",
              type: "TEXT",
              sequence: 0,
              text: "text"
            },
            {
              id: "education263",
              type: "IMAGE",
              sequence: 1,
              images: [
                {
                  id: "education264",
                  url: "https://www.w3schools.com/css/img_lights.jpg",
                  caption: "",
                  path: "b48d43b6-0fd2-455d-8402-5579ca0f7c15",
                  touched: true
                },
                {
                  id: "education300",
                  url: "",
                  path: "",
                  caption: "",
                  touched: false
                }
              ]
            },
            {
              id: "education271",
              type: "VIDEO",
              sequence: 2,
              url: "https://www.w3schools.com/css/img_lights.jpg",
              text: "",
              path: "35ce8879-2c18-4f6f-9d6b-156e5bce1958",
              touched: true
            }
          ]
        },
      ],
    },
  ],
  attachment: {
    path: "SCRATCH_1",
    url: "https://www.w3schools.com/css/img_lights.jpg"
  }
};

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('educationEditorSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(educationEditorSlice.reducer(undefined, { type: '' })).toEqual(
      educationEditorInitialState
    );
  });

  it('should support publication loading successful lifecycle', () => {
    const loadingState = educationEditorSlice.reducer(
      undefined,
      educationEditorSlice.actions.loadingStarted()
    );
    expect(loadingState).toMatchObject({ isLoading: true });
    expect(
      educationEditorSlice.reducer(loadingState, educationEditorSlice.actions.loadingFinished())
    ).toMatchObject({ isLoading: false });
  });

  it('should support publication saving successful lifecycle', () => {
    const savingState = educationEditorSlice.reducer(
      undefined,
      educationEditorSlice.actions.savingStarted()
    );
    expect(savingState).toMatchObject({ isSaving: true });

    const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
    dateSpy.mockReturnValue(1);

    expect(
      educationEditorSlice.reducer(
        savingState,
        educationEditorSlice.actions.savingFinished({
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

  it('should set publication', () => {
    expect(
      educationEditorSlice.reducer(
        undefined,
        educationEditorSlice.actions.setEducation(emptyPublication)
      ).data
    ).toMatchObject({ ...emptyPublication });
  });

  it('[NEGATIVE] should set errors', () => {
    const educationErrors: EducationEditorErrors = {
      title: { empty: true },
      category: {},
      attachment: {},
      items: [],
    };

    expect(
      educationEditorSlice.reducer(
        undefined,
        educationEditorSlice.actions.setEducationErrors(educationErrors)
      ).errors
    ).toMatchObject({ ...educationErrors });
  });

  it('should touch', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
    dateSpy.mockReturnValue(1);

    expect(
      educationEditorSlice.reducer(undefined, educationEditorSlice.actions.updateLastTouched())
    ).toMatchObject({ lastTouchedOn: 1 });
  });

  it('should clear transient state', () => {
    expect(
      educationEditorSlice.reducer(
        {
          title: {},
          category: {},
          attachment: {},
          items: [],
        } as unknown as EducationEditorState,
        educationEditorSlice.actions.clearTransientState()
      )
    ).toMatchObject({
      lastTouchedOn: undefined,
      savedOn: undefined,
      errors: undefined,
    });
  });
});

describe('actions', () => {
  describe('loadEducationContent', () => {
    it('should load publication', async () => {
      expect(educationEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedEducationSelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        type: '' as EducationalContentType,
        status: '' as EducationalContentStatus,
        title: '',
        category: '',
        content: [],
      });

      const educationId = 'test-id';
      const onError = jest.fn();

      dispatch(loadEducationContent({ studyId, educationId, onError }));

      expect(onError).not.toHaveBeenCalled();
      expect(editedEducationSelector(store.getState())).toEqual(
        expect.objectContaining({
          studyId: '',
          id: '',
          type: '' as EducationalContentType,
          status: '' as EducationalContentStatus,
          title: '',
          category: '',
          content: [],
        })
      );
    });

    it('[NEGATIVE] should catch error while data loading', async () => {
      expect(educationEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedEducationSelector(store.getState())).toEqual({
        content: [],
        status: '',
        id: '',
        studyId: '',
        type: '',
        title: '',
        category: '',
      });

      const educationId = 'broken-publication-id';
      const onError = jest.fn();

      await dispatch(loadEducationContent({ studyId, educationId, onError }));

      expect(onError).toHaveBeenCalled();
      expect(editedEducationSelector(store.getState())).toEqual(
        {
          studyId: '',
          id: '',
          type: '' as EducationalContentType,
          status: '' as EducationalContentStatus,
          title: '',
          category: '',
          content: [],
        }
      );
    });
  });

  describe('saveEducationContent', () => {
    it('should save publication', async () => {
      dispatch(educationEditorSlice.actions.setEducation(testPublication));
      dispatch(educationEditorSlice.actions.updateLastTouched());

      const lastTouched = educationEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);

      dispatch(saveEducationContent());

      expect(educationEditorIsSavingSelector(store.getState())).toBeTruthy();

      await waitFor(() => educationEditorIsSavingSelector(store.getState()));
      await waitFor(() => !educationEditorIsSavingSelector(store.getState()));

      expect(educationEditorIsSavingSelector(store.getState())).toBeFalsy();
    });

    it('[NEGATIVE] should catch error while request', async () => {
      dispatch(educationEditorSlice.actions.setEducation(testPublication));
      dispatch(educationEditorSlice.actions.updateLastTouched());

      await API.mock.maskEndpointAsFailure('updateEducation', async () => {
        await dispatch(saveEducationContent());
      });

      await waitFor(() => educationEditorIsSavingSelector(store.getState()));
      await waitFor(() => !educationEditorIsSavingSelector(store.getState()));

      expect(educationEditorIsFailedConnectionSelector(store.getState())).toBeTruthy();
    });
  });
});

describe('useEducationEditor', () => {
  const setUpPublicationEditorHook = () =>
    renderHook(() => useEducationEditor(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

  let hook: ReturnType<typeof setUpPublicationEditorHook>;

  const unsetHook = (h: ReturnType<typeof setUpPublicationEditorHook>) => {
    act(() => {
      h.unmount();
    });
  };

  afterEach(() => {
    unsetHook(hook);
  });

  describe('generateEducationContent', () => {
    it('should generate publication', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.generateEducation({
          studyId,
          sourceType: EducationalContentType.SCRATCH
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      expect(hook.result.current.education).toEqual(
        expect.objectContaining({
          status: 'DRAFT',
          type: 'SCRATCH',
          title: '',
          category: '',
          content: expect.any(Object)
        })
      );
    });
  });

  describe('loadEducationContent', () => {
    it('should load publication', async () => {
      hook = setUpPublicationEditorHook();

      const educationId = 'test-id';
      const onError = jest.fn();

      await act(() => {
        hook.result.current.loadEducation({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      expect(hook.result.current.education).toEqual(
        expect.objectContaining({
          id: "test-id",
          status: expect.any(String),
          type: expect.any(String),
          title: expect.any(String),
          category: expect.any(String),
          content: expect.any(Object)
        })
      );
    });

    it('[NEGATIVE] should load publication with failed response', async () => {
      hook = setUpPublicationEditorHook();

      const educationId = '1';
      const error = 'test-error';
      const onError = jest.fn();

      await maskEndpointAsFailure(
        'getEducation',
        async () => {
          await act(() => {
            hook.result.current.loadEducation({
              studyId,
              educationId,
              onError,
            });
          });

          await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
        },
        { message: error }
      );

      expect(onError).toHaveBeenCalled();
    });

    it('should reload publication', async () => {
      hook = setUpPublicationEditorHook();

      const educationId = 'test-id';
      const onError = jest.fn();

      await act(() => {
        hook.result.current.loadEducation({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      await act(() => {
        hook.result.current.loadEducation({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      await act(() => {
        hook.result.current.loadEducation({
          studyId: 'other-study',
          educationId: 'other-id',
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();
    });

    it('[NEGATIVE] should reload publication with error', async () => {
      hook = setUpPublicationEditorHook();

      const educationId = '1';
      const onError = jest.fn();

      await act(() => {
        hook.result.current.loadEducation({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.education).toEqual(
        expect.objectContaining({
          ...emptyPublication,
        })
      );

      await maskEndpointAsFailure(
        'getEducation',
        async () => {
          await act(() => {
            hook.result.current.loadEducation({
              studyId,
              educationId,
              onError,
            });
          });

          await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
        },
        { message: 'error' }
      );

      expect(hook.result.current.education).toEqual(
        expect.objectContaining({
          ...emptyPublication,
        })
      );
    });
  });

  describe('setEducation', () => {
    it('should set publication', () => {
      hook = setUpPublicationEditorHook();

      expect(hook.result.current.lastTouchedOn).toBeUndefined();

      act(() => {
        hook.result.current.setEducation(testPublication);
      });

      expect(hook.result.current.lastTouchedOn).toEqual(expect.any(Number));
      expect(hook.result.current.education).toEqual(
        expect.objectContaining({
          ...testPublication,
        })
      );
    });
  });

  describe('add publication item', () => {
    it('should add publication item', () => {
      hook = setUpPublicationEditorHook();

      act(() => {
        hook.result.current.setEducation(testPublication);
      });

      const scratchContent = hook.result.current.education.content[0].children[0] as ScratchContent
      const { length } = scratchContent.blocks;

      act(() => {
        hook.result.current.addItem('TEXT');
      });

      expect((hook.result.current.education.content[0].children[0] as ScratchContent).blocks).toHaveLength(length + 1);
    });
  });

  describe('remove publication item', () => {
    it('should remove publication item', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setEducation(testPublication);
      });

      const scratchContent = hook.result.current.education.content[0].children[0] as ScratchContent
      const { length } = scratchContent.blocks;

      await act(() => {
        hook.result.current.removeBlock((hook.result.current.education.content[0].children[0] as ScratchContent).blocks[0]);
      });

      expect((hook.result.current.education.content[0].children[0] as ScratchContent).blocks).toHaveLength(length - 1);
    });
  });

  describe('update publication', () => {
    it('should update publication', () => {
      hook = setUpPublicationEditorHook();

      act(() => {
        hook.result.current.setEducation(testPublication);
      });

      expect(hook.result.current.education).toEqual(testPublication);

      const updates = { id: 'test-id' };
      const updatedSurvey = { ...testPublication, ...updates };

      act(() => {
        hook.result.current.updateEducation(updates);
      });

      expect(hook.result.current.education).toEqual(updatedSurvey);
    });
  });

  describe('save publication', () => {
    it('[NEGATIVE] should catch error while publication saving', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setEducation(testPublication);
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeUndefined();

      await API.mock.maskEndpointAsFailure('updateEducation', async () => {
        await act(() => hook.result.current.saveEducation());
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeTruthy();
    });
  });

  describe('update publication item', () => {
    it('should update item', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setEducation(testPublication);
      });

      expect(hook.result.current.education).toEqual(testPublication);

      const scratchContent = hook.result.current.education.content[0].children[0] as ScratchContent
      const itemToUpdate = { ...scratchContent.blocks[0], text: 'updated' } as TextBlock;

      await act(() => {
        hook.result.current.updateBlock(itemToUpdate);
      });

      expect((hook.result.current.education.content[0].children[0] as ScratchContent).blocks[0]).toEqual(itemToUpdate);
    });

    it('[NEGATIVE] should ignore update to non-matching item', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setEducation(testPublication);
      });

      expect(hook.result.current.education).toEqual(testPublication);

      await act(() => {
        hook.result.current.updateBlock({
          id: 'unknown',
          type: 'TEXT',
          text: '123',
          sequence: 0,
        });
      });

      expect(hook.result.current.education).toEqual(testPublication);
    });
  });

  describe('validateEducation', () => {
    it('[NEGATIVE] should validate and clear existing errors on update', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setEducation(testPublication);
      });

      expect(hook.result.current.education).toEqual(testPublication);

      await act(() => {
        hook.result.current.updateEducation({ title: '' });
      });
      await act(() => {
        hook.result.current.validateEducation();
      });

      expect(hook.result.current.errors).toBeDefined();
      hook.result.current.errors &&
        expect(hasSomeEducationErrors(hook.result.current.errors)).toBeTrue();

      await act(() => {
        hook.result.current.updateEducation({ title: 'Title' });
      });
      expect(hook.result.current.errors).toBeDefined();
      hook.result.current.errors &&
        expect(hasSomeEducationErrors(hook.result.current.errors)).toBeFalse();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.reset();
      });
      expect(store.getState()['education/educationEditor']).toEqual(
        educationEditorInitialState
      );
    });
  });
});
