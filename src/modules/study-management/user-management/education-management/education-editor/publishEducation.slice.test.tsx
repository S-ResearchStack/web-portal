import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';

import { maskEndpointAsSuccess } from 'src/modules/api/mock';
import { makeHistory } from 'src/modules/navigation/store';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import { educationListDataSelector } from 'src/modules/study-management/user-management/education-management/educationList.slice';
import {
  editedPublicationSelector,
  EducationEditorState,
  PublicationContentSection,
  PublicationItem,
} from './educationEditor.slice';
import {
  publishEducationSelector,
  publishEducationSlice,
  usePublishEducationSlice,
} from './publishEducation.slice';

describe('publishEducationSlice', () => {
  it('should make empty state', () => {
    expect(publishEducationSlice.reducer(undefined, { type: 0 })).toEqual({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should select from empty slice', async () => {
    expect(publishEducationSelector({} as ReturnType<typeof store.getState>)).toBeUndefined();
  });
});

const publicationImageItemId = 'test-id-1';
const publicationTextItemId = 'test-id-2';

const educationContentItem: PublicationContentSection = {
  id: 'education-content-test-id',
  children: [
    {
      id: publicationImageItemId,
      type: 'IMAGE',
      sequence: 1,
      images: [{ id: 'test-image', caption: '', image: '1' }],
    },
    {
      id: publicationTextItemId,
      type: 'TEXT',
      text: 'test-text',
      sequence: 0,
    },
  ],
};

const educationEditData: PublicationItem = {
  studyId: 'test',
  id: 'test-id',
  revisionId: 0,
  title: 'test',
  status: 'DRAFT',
  source: 'SCRATCH',
  educationContent: [educationContentItem],
};

const educationEditState: EducationEditorState = {
  isSaving: false,
  isLoading: false,
  data: educationEditData,
};

const studiesState: StudiesState = {
  isLoading: false,
  studies: [
    {
      id: 'test',
      name: 'test',
      color: 'primary',
      createdAt: 1652648400000,
    },
  ],
  selectedStudyId: 'test',
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();
let store: ReturnType<typeof createTestStore>;
let history: ReturnType<typeof makeHistory>;

beforeEach(() => {
  history = makeHistory();
  store = createTestStore(
    {
      studies: studiesState,
      'studyManagement/educationEditor': { ...educationEditState },
      'studyManagement/educationList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [
            {
              id: 'test-draft',
              title: 'test',
              status: 'DRAFT',
              revisionId: 1,
              source: 'PDF',
              modifiedAt: new Date().valueOf(),
            },
          ],
          published: [
            {
              id: 'test-published',
              title: 'test',
              status: 'PUBLISHED',
              revisionId: 2,
              source: 'SCRATCH',
              modifiedAt: new Date().valueOf(),
            },
          ],
        },
      },
    },
    history
  );
});

const setUpHook = () =>
  renderHook(() => usePublishEducationSlice(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const invalidPublishedTime = DateTime.fromMillis(1000000).toISODate();
const validPublishTime = DateTime.fromMillis(Date.now()).toISODate();

const unsetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.unmount();
};

describe('usePublishEducationSlice', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(async () => {
    await act(() => unsetHook(hook));
  });

  it('should publish education content', async () => {
    hook = setUpHook();

    expect(publishEducationSelector(store.getState()).isSending).toBeFalse();
    expect(educationListDataSelector(store.getState())?.published.length).toBe(1);

    await act(() => {
      hook.result.current.publish(validPublishTime);
    });

    await waitFor(() => expect(publishEducationSelector(store.getState()).isSending).toBeFalse());

    expect(educationListDataSelector(store.getState())?.published.length).toBe(2);
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    hook = setUpHook();

    expect(publishEducationSelector(store.getState()).error).toBeUndefined();
    expect(publishEducationSelector(store.getState()).isSending).toBeFalse();

    await maskEndpointAsSuccess(
      'updateEducationPublication',
      async () => {
        await act(() => {
          hook.result.current.publish(invalidPublishedTime);
        });

        await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());
      },
      { response: null }
    );

    expect(editedPublicationSelector(store.getState())).not.toBeUndefined();
  });
});
