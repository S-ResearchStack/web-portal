import { useCallback } from 'react';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import API, {
  Publication,
  PublicationContentItem,
  PublicationContentSource,
  PublicationContentType,
  PublicationImageOption,
  PublicationStatus,
} from 'src/modules/api';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';
import {
  pushDraftItem,
  sortTaskList,
  updateDraftItem,
} from 'src/modules/study-management/user-management/common/utils';
import { newId } from './utils';
import {
  educationListDataSelector,
  educationListSlice,
  findMockPublicationById,
  makePublicationsItem,
  mockPublications,
  PublicationListItem,
} from '../educationList.slice';

export const emptyImageItem = (
  p?: Pick<PublicationImageOption, 'touched'>
): PublicationImageOption & { value: string } => ({
  id: newId(),
  image: '',
  value: '',
  ...p,
});

export type PublicationContentSection = {
  id: string;
  children: PublicationContentItem[];
};

export interface PublicationItem {
  id: string;
  title: string;
  source: PublicationContentSource;
  modifiedAt?: number;
  publishedAt?: number;
  status: PublicationStatus;
  attachment?: string;
  category?: string;
  educationContent: PublicationContentSection[];
  studyId: string;
  revisionId: number;
}

export type EducationItemErrors = {
  id: string;
  text?: { empty?: boolean };
  images?: { empty?: boolean };
};

export type EducationEditorErrors = {
  title: { empty?: boolean };
  category: { empty?: boolean };
  attachment: { empty?: boolean };
  items: EducationItemErrors[];
};

export type EducationEditorState = {
  isSaving: boolean;
  isLoading: boolean;
  lastTouchedOn?: number;
  savedOn?: number;
  errors?: EducationEditorErrors;
  isFailedConnection?: boolean;
  data?: PublicationItem;
};

API.mock.provideEndpoints({
  getEducationPublication({ id }) {
    const publication = findMockPublicationById(id);
    return publication
      ? API.mock.response([publication])
      : API.mock.failedResponse({ status: 404, message: 'Not found' });
  },
  updateEducationPublication({ id }, publication) {
    const idx = mockPublications.findIndex((t) => t.id === id);
    if (idx !== -1) {
      mockPublications[idx] = { ...mockPublications[idx], ...publication } as Publication;
    }
    return API.mock.response(undefined);
  },
});

export const educationEditorInitialState: EducationEditorState = {
  isSaving: false,
  isLoading: false,
};

export const educationEditorSlice = createSlice({
  name: 'studyManagement/educationEditor',
  initialState: educationEditorInitialState,
  reducers: {
    loadingStarted: (state) => {
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    savingStarted: (state) => {
      state.isSaving = true;
    },
    savingFinished: (
      state,
      action: PayloadAction<{ error?: boolean; isFailedConnection?: boolean }>
    ) => {
      state.isSaving = false;
      if (!action.payload.error) {
        state.savedOn = Date.now();
      }
      state.isFailedConnection = !!action.payload.isFailedConnection;
    },
    setPublication(state, action: PayloadAction<PublicationItem | undefined>) {
      state.data = action.payload;
    },
    setPublicationErrors(state, action: PayloadAction<EducationEditorErrors>) {
      state.errors = action.payload;
    },
    clearTransientState(state) {
      state.lastTouchedOn = undefined;
      state.savedOn = undefined;
      state.errors = undefined;
    },
    updateLastTouched(state) {
      state.lastTouchedOn = Date.now();
    },
    reset() {
      return { ...educationEditorInitialState };
    },
  },
});

export const {
  loadingStarted,
  loadingFinished,
  savingStarted,
  savingFinished,
  setPublication,
  setPublicationErrors,
  clearTransientState,
  updateLastTouched,
  reset,
} = educationEditorSlice.actions;

const publicationContentItemFromApi = (
  ti: PublicationContentItem
): PublicationContentItem | undefined => {
  if (ti.type === 'IMAGE') {
    let imageContent: PublicationImageOption[] = [...ti.images];
    if (!ti.images.length) {
      imageContent = [emptyImageItem({ touched: true }), emptyImageItem({ touched: false })];
    } else if (ti.images.length < 8) {
      imageContent = [
        ...ti.images
          .map((i) => ({ ...i, touched: true }))
          .filter((i) => i.image !== '' && i.touched),
        emptyImageItem({ touched: false }),
      ];
    }

    return {
      ...ti,
      images: imageContent,
    };
  }

  return ti;
};

const publicationContentItemListFromApi = (
  ti: PublicationContentItem[]
): PublicationContentItem[] => {
  const sortedTaskItem = [...ti].sort((a, b) => a.sequence - b.sequence);
  return sortedTaskItem
    .map(publicationContentItemFromApi)
    .filter(Boolean) as PublicationContentItem[];
};

export const emptySection = (
  s?: Partial<PublicationContentSection>
): PublicationContentSection => ({
  id: newId(),
  children: [],
  ...s,
});

export const publicationFromApi = (studyId: string, t: Publication): PublicationItem =>
  ({
    studyId,
    ...t,
    title: t.title || '',
    category: t.category || '',
    educationContent: [
      emptySection({
        children: t.educationContent
          ? publicationContentItemListFromApi(t.educationContent) // TODO remove when api will be ready
          : [],
      }),
    ],
  } as PublicationItem);

const publicationUpdateToApi = (s: PublicationItem): Publication => ({
  ...s,
  publishedAt: s.publishedAt ? new Date(s.publishedAt).toISOString() : undefined,
  modifiedAt: s.modifiedAt ? new Date(s.modifiedAt).toISOString() : undefined,
  educationContent: s.educationContent
    .map((section) => section.children)
    .flat()
    .map((i, sequence) => ({
      ...i,
      sequence,
    })),
});

export const loadPublication =
  ({
    studyId,
    publicationId,
    onError,
  }: {
    studyId: string;
    publicationId: string;
    onError: () => void;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(loadingStarted());
      const {
        data: [publication],
      } = await API.getEducationPublication({ projectId: studyId, id: publicationId });
      dispatch(setPublication(publicationFromApi(studyId, publication)));
      dispatch(clearTransientState());
    } catch (err) {
      onError();
    } finally {
      dispatch(loadingFinished());
    }
  };

const getPublicationErrors = ({
  item: s,
  currentErrors: cur,
}: {
  item: PublicationItem;
  currentErrors?: EducationEditorErrors;
}): EducationEditorErrors => {
  const items = s.educationContent.map((section) => section.children).flat();

  // only clear existing errors
  if (cur) {
    return {
      title: { empty: cur.title.empty && !s.title },
      category: { empty: cur.category.empty && !s.category },
      attachment: { empty: cur.attachment.empty && !s.attachment },
      items: items.map((q) => ({
        id: q.id,
        text: {
          empty:
            q.type === 'TEXT'
              ? cur.items.find((qq) => qq.id === q.id)?.text?.empty && !q.text
              : false,
        },
        images: {
          empty:
            q.type === 'IMAGE'
              ? cur.items.find((qq) => qq.id === q.id)?.images?.empty && !q.images.length
              : false,
        },
      })),
    };
  }

  return {
    title: { empty: !s.title },
    category: { empty: !s.category },
    attachment: { empty: !s.attachment },
    items: items.map((q) => ({
      id: q.id,
      text: {
        empty: q.type === 'TEXT' ? !q.text : false,
      },
      images: {
        empty: q.type === 'IMAGE' ? !q.images.length : false,
      },
    })),
  };
};

const hasPublicationTitleErrors = (se: EducationEditorErrors) => !!se.title.empty;
const hasPublicationCategoryErrors = (se: EducationEditorErrors) => !!se.category.empty;
const hasPublicationAttachmentErrors = (se: EducationEditorErrors) => !!se.attachment.empty;
export const hasPublicationItemsErrors = (qe: EducationItemErrors) =>
  !!qe.text?.empty || !!qe.images?.empty;
export const hasSomePublicationErrors = (se: EducationEditorErrors) =>
  hasPublicationTitleErrors(se) ||
  hasPublicationCategoryErrors(se) ||
  hasPublicationAttachmentErrors(se) ||
  se.items.some(hasPublicationItemsErrors);

// TODO: should assume empty activity somehow else
export const editedPublicationSelector = (state: RootState) =>
  state[educationEditorSlice.name].data ||
  ({
    studyId: '',
    id: '',
    revisionId: 0,
    source: '' as PublicationContentSource,
    status: '' as PublicationStatus,
    title: '',
    category: '',
    educationContent: [],
  } as PublicationItem);

const educationEditorPublicationErrorsSelector = (state: RootState) =>
  state[educationEditorSlice.name].errors;

const transformPublicationListItemToPublicationItem = (
  i: PublicationListItem
): PublicationItem => ({
  ...i,
  id: '',
  studyId: '',
  educationContent: [],
});

export const editEducationPublication =
  ({ educationId }: { educationId: string }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      const studyId = selectedStudyIdSelector(getState());
      if (!studyId) {
        return;
      }
      const publicationList = educationListDataSelector(getState());
      const preloadedPublicationItem = publicationList?.drafts.find((t) => t.id === educationId);
      const publicationItem =
        preloadedPublicationItem &&
        transformPublicationListItemToPublicationItem(preloadedPublicationItem);

      dispatch(setPublication(publicationItem));
      dispatch(clearTransientState());
      dispatch(push(generatePath(Path.StudyManagementEditEducation, { educationId })));
    } catch (err) {
      // TODO: what to show?
      console.error(err);
    }
  };

export const AUTOSAVE_DEBOUNCE_INTERVAL = 100;

export const savePublicationIfRequired =
  ({ force }: { force?: boolean }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { isSaving, lastTouchedOn, data } = getState()[educationEditorSlice.name];

    if (
      !data ||
      isSaving ||
      !lastTouchedOn ||
      (!force && Date.now() - lastTouchedOn <= AUTOSAVE_DEBOUNCE_INTERVAL)
    ) {
      return;
    }

    try {
      dispatch(savingStarted());

      const [apiTask] = (
        await API.getEducationPublication({ projectId: data.studyId, id: data.id })
      ).data;
      const task = { ...apiTask, ...publicationUpdateToApi(data) };
      const res = await API.updateEducationPublication(
        { projectId: data.studyId, id: data.id, revisionId: data.revisionId },
        task
      );
      res.checkError();

      const list = educationListDataSelector(getState());
      if (list) {
        const hasItem = list.drafts.findIndex((i) => i.id === task.id) > -1;
        const categories = sortTaskList(
          (hasItem ? updateDraftItem : pushDraftItem)(
            publicationFromApi('', task) as PublicationListItem,
            list,
            (i) => ({
              ...i,
              modifiedAt: Date.now(),
            })
          )
        );

        dispatch(educationListSlice.actions.setData({ data: categories }));
      }

      dispatch(savingFinished({ error: false }));
    } catch (err) {
      dispatch(savingFinished({ error: true, isFailedConnection: true }));
    }
  };

let autoSaveTimeoutId = 0;

export const autoSaveIfRequired = (): AppThunk => (dispatch) => {
  if (autoSaveTimeoutId) {
    clearTimeout(autoSaveTimeoutId);
  }
  autoSaveTimeoutId = window.setTimeout(async () => {
    await dispatch(savePublicationIfRequired({ force: false }));
  }, AUTOSAVE_DEBOUNCE_INTERVAL);
};

const updatePublication =
  (publication: PublicationItem): AppThunk =>
  (dispatch, getState) => {
    const activityErrors = educationEditorPublicationErrorsSelector(getState());

    dispatch(setPublication(publication));
    dispatch(updateLastTouched());
    dispatch(autoSaveIfRequired());
    activityErrors &&
      dispatch(
        setPublicationErrors(
          getPublicationErrors({
            item: publication,
            currentErrors: activityErrors,
          })
        )
      );
  };

export const educationEditorIsLoadingSelector = (state: RootState) =>
  state[educationEditorSlice.name].isLoading;
export const educationEditorIsSavingSelector = (state: RootState) =>
  state[educationEditorSlice.name].isSaving;
export const educationEditorIsFailedConnectionSelector = (state: RootState) =>
  state[educationEditorSlice.name].isFailedConnection;
export const educationEditorLastTouchedSelector = (state: RootState) =>
  state[educationEditorSlice.name].lastTouchedOn;
const educationSavedOnSelector = (state: RootState) => state[educationEditorSlice.name].savedOn;

export const useEducationEditor = () => {
  const publication = useAppSelector(editedPublicationSelector);
  const isLoading = useAppSelector(educationEditorIsLoadingSelector);
  const isSaving = useAppSelector(educationEditorIsSavingSelector);
  const educationErrors = useAppSelector(educationEditorPublicationErrorsSelector);
  const savedOn = useAppSelector(educationSavedOnSelector);
  const isFailedConnection = useAppSelector(educationEditorIsFailedConnectionSelector);
  const lastTouchedOn = useAppSelector(educationEditorLastTouchedSelector);
  const dispatch = useAppDispatch();

  const load = useCallback(
    ({
      studyId,
      educationId,
      onError,
    }: {
      studyId: string;
      educationId: string;
      onError: () => void;
    }) => {
      if (!isLoading && educationId !== publication?.id) {
        dispatch(loadPublication({ studyId, publicationId: educationId, onError }));
      }
    },
    [dispatch, isLoading, publication?.id]
  );

  const set = useCallback(
    (a: PublicationItem) => {
      dispatch(updatePublication(a));
    },
    [dispatch]
  );

  const setPartial = useCallback(
    (a: Partial<PublicationItem>) => {
      set({ ...publication, ...a } as PublicationItem);
    },
    [publication, set]
  );

  const updateItem = useCallback(
    (item: Partial<PublicationContentItem>) => {
      set({
        ...publication,
        educationContent: publication.educationContent.map((s) => ({
          ...s,
          children: s.children.map((q) =>
            q.id === item.id
              ? ({ ...q, ...item } as PublicationContentItem)
              : ({ ...q } as PublicationContentItem)
          ),
        })),
      });
    },
    [publication, set]
  );

  const removeItem = useCallback(
    (item: Partial<PublicationContentItem>) => {
      set({
        ...publication,
        educationContent: publication.educationContent.map((s) => ({
          ...s,
          children: s.children.filter((i) => i.id !== item.id),
        })),
      });
    },
    [publication, set]
  );

  const addItem = useCallback(
    (type: PublicationContentType) => {
      set({
        ...publication,
        educationContent: publication.educationContent.map((s, idx) => ({
          ...s,
          // add to first section
          children:
            idx === 0
              ? [
                  ...s.children,
                  publicationContentItemFromApi(
                    makePublicationsItem(type, s.children.length)
                  ) as PublicationContentItem,
                ]
              : s.children,
        })),
      });
    },
    [set, publication]
  );

  const validatePublication = useCallback(() => {
    const se = getPublicationErrors({
      item: publication,
    });
    dispatch(setPublicationErrors(se));
    return se;
  }, [publication, dispatch]);

  const savePublication = useCallback(async () => {
    await dispatch(savePublicationIfRequired({ force: true }));
  }, [dispatch]);

  const resetAll = useCallback(() => dispatch(reset()), [dispatch]);

  return {
    publication,
    educationErrors,
    loadPublication: load,
    setPublication: set,
    isLoading,
    savedOn,
    updatePublication: setPartial,
    updateItem,
    validatePublication,
    savePublication,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
    reset: resetAll,
    addItem,
    removeItem,
  };
};

export default {
  [educationEditorSlice.name]: educationEditorSlice.reducer,
};
