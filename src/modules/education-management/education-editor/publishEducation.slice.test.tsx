import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';

import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import { makeHistory } from 'src/modules/navigation/store';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import {
  editedEducationSelector,
  EducationEditorState,
  EducationItem,
  PublicationContentSection
} from './educationEditor.slice';
import {
  publishEducationSelector,
  publishEducationSlice,
  usePublishEducationSlice,
} from './publishEducation.slice';
import { EducationalContentType } from 'src/modules/api';

const studyId = 'test-study';
const publicationTextItemId = 'test-id-text';
const publicationImageItemId = 'test-id-image';
const publicationVideoItemId = 'test-id-video';

const educationContentItems: PublicationContentSection = {
  id: 'section-id',
  children: [
    {
      id: 'test-image-1',
      description: '',
      coverImage: 'SCRATCH_1',
      blocks: [
        {
          id: publicationTextItemId,
          type: "TEXT",
          sequence: 0,
          text: "text"
        },
        {
          id: publicationImageItemId,
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
          id: publicationVideoItemId,
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
};

const educationEditData: EducationItem = {
  studyId: studyId,
  id: 'test-id',
  type: EducationalContentType.SCRATCH,
  status: 'DRAFT',
  title: '',
  category: '',
  content: [educationContentItems],
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
      id: studyId,
      name: 'test',
      color: 'primary',
      createdAt: 1652648400000,
    },
  ],
  selectedStudyId: studyId,
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();
let store: ReturnType<typeof createTestStore>;
let history: ReturnType<typeof makeHistory>;

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

beforeEach(() => {
  history = makeHistory();
  store = createTestStore(
    {
      studies: studiesState,
      'education/educationEditor': { ...educationEditState },
      'education/educationList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [
            {
              id: 'test-draft',
              title: 'test',
              status: 'DRAFT',
              type: EducationalContentType.PDF,
              modifiedAt: new Date().valueOf(),
            },
          ],
          published: [
            {
              id: 'test-published',
              title: 'test',
              status: 'PUBLISHED',
              type: EducationalContentType.SCRATCH,
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

    await act(() => {
      hook.result.current.publish(validPublishTime);
    });

    await waitFor(() => expect(publishEducationSelector(store.getState()).isSending).toBeFalse());

    expect(publishEducationSelector(store.getState()).error).toBeUndefined();
  });

  it('[NEGATIVE] should publish error', async () => {
    hook = setUpHook();

    expect(publishEducationSelector(store.getState()).error).toBeUndefined();
    expect(publishEducationSelector(store.getState()).isSending).toBeFalse();

    await maskEndpointAsFailure(
      'updateEducation',
      async () => {
        await act(() => {
          hook.result.current.publish(invalidPublishedTime);
        });

        await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());
      },
      { message: 'error' }
    );

    expect(publishEducationSelector(store.getState()).error).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    hook = setUpHook();

    expect(publishEducationSelector(store.getState()).error).toBeUndefined();
    expect(publishEducationSelector(store.getState()).isSending).toBeFalse();

    await maskEndpointAsSuccess(
      'updateEducation',
      async () => {
        await act(() => {
          hook.result.current.publish(invalidPublishedTime);
        });

        await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());
      },
      { response: null }
    );

    expect(editedEducationSelector(store.getState())).not.toBeUndefined();
  });
});
