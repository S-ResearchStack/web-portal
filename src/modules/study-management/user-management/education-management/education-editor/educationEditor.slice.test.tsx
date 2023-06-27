import React from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor, act } from '@testing-library/react';
import _cloneDeep from 'lodash/cloneDeep';

import { makeHistory } from 'src/modules/navigation/store';
import Api, {
  PublicationContentSource,
  PublicationContentText,
  PublicationStatus,
} from 'src/modules/api';
import { expectToBeDefined } from 'src/common/utils/testing';
import { maskEndpointAsFailure } from 'src/modules/api/mock';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import { createEducationSelector } from '../createPublication.slice';
import {
  AUTOSAVE_DEBOUNCE_INTERVAL,
  editedPublicationSelector,
  EducationEditorErrors,
  educationEditorInitialState,
  educationEditorIsFailedConnectionSelector,
  educationEditorIsLoadingSelector,
  educationEditorIsSavingSelector,
  educationEditorLastTouchedSelector,
  educationEditorSlice,
  EducationEditorState,
  hasSomePublicationErrors,
  loadPublication,
  PublicationItem,
  savePublicationIfRequired,
  useEducationEditor,
} from './educationEditor.slice';
import { newId } from './utils';

const emptyPublication = {
  studyId: '',
  id: '',
  revisionId: 0,
  source: '' as PublicationContentSource,
  status: '' as PublicationStatus,
  title: '',
  category: '',
  educationContent: [],
};

const studyId = 'test-study';

const testPublication: PublicationItem = {
  studyId: '',
  id: '1',
  revisionId: 0,
  title: 'test-title',
  source: 'SCRATCH',
  status: 'DRAFT',
  category: 'test-category',
  attachment: 'test-attachment',
  educationContent: [
    {
      id: 'section-id',
      children: [
        {
          id: 'test-image-1',
          type: 'IMAGE',
          sequence: 1,
          images: [{ id: 'test-image', caption: '', image: '1' }],
        },
        {
          id: 'test-text-1',
          type: 'TEXT',
          text: 'test-text',
          sequence: 0,
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

afterEach(() => {
  jest.restoreAllMocks();
});

describe('educationEditorSlice', () => {
  it('should make empty state', () => {
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
        educationEditorSlice.actions.setPublication(emptyPublication)
      ).data
    ).toMatchObject({ ...emptyPublication });
  });

  it('should set errors', () => {
    const educationErrors: EducationEditorErrors = {
      title: { empty: true },
      category: {},
      attachment: {},
      items: [
        {
          id: 'test-id',
        },
      ],
    };

    expect(
      educationEditorSlice.reducer(
        undefined,
        educationEditorSlice.actions.setPublicationErrors(educationErrors)
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
  describe('loadPublication', () => {
    it('should load publication', async () => {
      expect(educationEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedPublicationSelector(store.getState())).toEqual({
        studyId: '',
        id: '',
        revisionId: 0,
        source: '' as PublicationContentSource,
        status: '' as PublicationStatus,
        title: '',
        category: '',
        educationContent: [],
      });

      const publicationId = '1';
      const onError = jest.fn();

      dispatch(loadPublication({ studyId, publicationId, onError }));

      await waitFor(() => createEducationSelector(store.getState()));
      await waitFor(() => !createEducationSelector(store.getState()));

      expect(editedPublicationSelector(store.getState())).toEqual(
        expect.objectContaining({
          studyId: '',
          id: '',
          revisionId: 0,
          source: '' as PublicationContentSource,
          status: '' as PublicationStatus,
          title: '',
          category: '',
          educationContent: [],
        })
      );
    });

    it('[NEGATIVE] should catch error while data loading', async () => {
      expect(educationEditorIsLoadingSelector(store.getState())).toBeFalsy();
      expect(editedPublicationSelector(store.getState())).toEqual({
        educationContent: [],
        revisionId: 0,
        status: '',
        id: '',
        studyId: '',
        source: '',
        title: '',
        category: '',
      });

      const publicationId = 'broken-publication-id';
      const onError = jest.fn();

      await dispatch(loadPublication({ studyId, publicationId, onError }));

      await waitFor(() => !createEducationSelector(store.getState()));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('saveIfRequired', () => {
    it('should save publication', async () => {
      dispatch(educationEditorSlice.actions.setPublication(testPublication));
      dispatch(educationEditorSlice.actions.updateLastTouched());

      const lastTouched = educationEditorLastTouchedSelector(store.getState());
      expectToBeDefined(lastTouched);
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation();
      dateSpy.mockReturnValue(lastTouched + AUTOSAVE_DEBOUNCE_INTERVAL + 1);

      dispatch(savePublicationIfRequired({}));

      expect(educationEditorIsSavingSelector(store.getState())).toBeTruthy();

      await waitFor(() => educationEditorIsSavingSelector(store.getState()));
      await waitFor(() => !educationEditorIsSavingSelector(store.getState()));

      expect(educationEditorIsSavingSelector(store.getState())).toBeFalsy();
    });

    it('[NEGATIVE] should catch error while request', async () => {
      dispatch(educationEditorSlice.actions.setPublication(emptyPublication));
      dispatch(educationEditorSlice.actions.updateLastTouched());

      await Api.mock.maskEndpointAsFailure('updateEducationPublication', async () => {
        await dispatch(savePublicationIfRequired({ force: true }));
      });

      expect(educationEditorIsFailedConnectionSelector(store.getState())).toBeTruthy();
    });
  });
});

describe('newId', () => {
  it('should create unique id', () => {
    expect(newId()).toMatch('education');
    expect(newId()).not.toBe(newId());
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

  describe('loadPublication', () => {
    it('should load publication', async () => {
      hook = setUpPublicationEditorHook();

      const educationId = '1';
      const onError = jest.fn();

      await act(() => {
        hook.result.current.loadPublication({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      expect(hook.result.current.publication).toEqual(
        expect.objectContaining({
          ...emptyPublication,
        })
      );
    });

    it('[NEGATIVE] should load publication with failed response', async () => {
      hook = setUpPublicationEditorHook();

      const educationId = '1';
      const error = 'test-error';
      const onError = jest.fn();

      await maskEndpointAsFailure(
        'getTask',
        async () => {
          await act(() => {
            hook.result.current.loadPublication({
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

      const educationId = '1';
      const onError = jest.fn();

      await act(() => {
        hook.result.current.loadPublication({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.isLoading).toBeFalsy();

      await act(() => {
        hook.result.current.loadPublication({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      await act(() => {
        hook.result.current.loadPublication({
          studyId: 'other-study',
          educationId: '2',
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
        hook.result.current.loadPublication({
          studyId,
          educationId,
          onError,
        });
      });

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.publication).toEqual(
        expect.objectContaining({
          ...emptyPublication,
        })
      );

      await maskEndpointAsFailure(
        'getEducationPublication',
        async () => {
          await act(() => {
            hook.result.current.loadPublication({
              studyId,
              educationId,
              onError,
            });
          });

          await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
        },
        { message: 'error' }
      );

      expect(hook.result.current.publication).toEqual(
        expect.objectContaining({
          ...emptyPublication,
        })
      );
    });
  });

  describe('setPublication', () => {
    it('should set publication', () => {
      hook = setUpPublicationEditorHook();

      expect(hook.result.current.lastTouchedOn).toBeUndefined();

      act(() => {
        hook.result.current.setPublication(testPublication);
      });

      expect(hook.result.current.lastTouchedOn).toEqual(expect.any(Number));
      expect(hook.result.current.publication).toEqual(
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
        hook.result.current.setPublication(testPublication);
      });

      const { length } = hook.result.current.publication.educationContent[0].children;

      act(() => {
        hook.result.current.addItem('TEXT');
      });

      expect(hook.result.current.publication.educationContent[0].children).toHaveLength(length + 1);
    });
  });

  describe('remove publication item', () => {
    it('should remove publication item', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setPublication(testPublication);
      });

      const { length } = hook.result.current.publication.educationContent[0].children;

      await act(() => {
        hook.result.current.removeItem({
          id: hook.result.current.publication.educationContent[0].children[0].id,
        });
      });

      expect(hook.result.current.publication.educationContent[0].children).toHaveLength(length - 1);
    });
  });

  describe('update publication', () => {
    it('should update publication', () => {
      hook = setUpPublicationEditorHook();

      act(() => {
        hook.result.current.setPublication(testPublication);
      });

      expect(hook.result.current.publication).toEqual(testPublication);

      const updates = { id: 'test-id' };
      const updatedSurvey = { ...testPublication, ...updates };

      act(() => {
        hook.result.current.updatePublication(updates);
      });

      expect(hook.result.current.publication).toEqual(updatedSurvey);
    });
  });

  describe('save publication', () => {
    it('[NEGATIVE] should catch error while publication saving', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setPublication(testPublication);
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeUndefined();

      await Api.mock.maskEndpointAsFailure('updateEducationPublication', async () => {
        await act(() => hook.result.current.savePublication());
      });

      expect(hook.result.current.savedOn).toBeUndefined();
      expect(hook.result.current.isFailedConnection).toBeTruthy();
    });
  });

  describe('update publication item', () => {
    it('should update item', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setPublication(testPublication);
      });

      expect(hook.result.current.publication).toEqual(testPublication);

      const updatedTestPublication = _cloneDeep(testPublication);
      const itemToUpdate = updatedTestPublication.educationContent[0]
        .children[1] as PublicationContentText;
      itemToUpdate.text = 'updated';

      await act(() => {
        hook.result.current.updateItem(itemToUpdate);
      });

      expect(hook.result.current.publication).toEqual(updatedTestPublication);
    });

    it('[NEGATIVE] should ignore update to non-matching item', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setPublication(testPublication);
      });

      expect(hook.result.current.publication).toEqual(testPublication);

      await act(() => {
        hook.result.current.updateItem({
          id: 'unknown',
          type: 'TEXT',
          text: '123',
          sequence: 0,
        });
      });

      expect(hook.result.current.publication).toEqual(testPublication);
    });
  });

  describe('validatePublication', () => {
    it('should validate and clear existing errors on update', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.setPublication(testPublication);
      });

      expect(hook.result.current.publication).toEqual(testPublication);

      const updatedTestPublication = _cloneDeep(testPublication);
      const itemToUpdate = updatedTestPublication.educationContent[0]
        .children[1] as PublicationContentText;

      itemToUpdate.text = '';
      await act(() => {
        hook.result.current.updateItem(itemToUpdate);
      });
      await act(() => {
        hook.result.current.validatePublication();
      });

      expect(hook.result.current.educationErrors).toBeDefined();
      hook.result.current.educationErrors &&
        expect(hasSomePublicationErrors(hook.result.current.educationErrors)).toBeTrue();

      itemToUpdate.text = 'something';
      await act(() => {
        hook.result.current.updateItem(itemToUpdate);
      });
      expect(hook.result.current.educationErrors).toBeDefined();
      hook.result.current.educationErrors &&
        expect(hasSomePublicationErrors(hook.result.current.educationErrors)).toBeFalse();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      hook = setUpPublicationEditorHook();

      await act(() => {
        hook.result.current.reset();
      });
      expect(store.getState()['studyManagement/educationEditor']).toEqual(
        educationEditorInitialState
      );
    });
  });
});
