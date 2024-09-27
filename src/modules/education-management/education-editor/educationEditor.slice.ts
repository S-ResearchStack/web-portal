import { useCallback } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Path } from 'src/modules/navigation/store';
import { HTTP_CODE_CONFLICT } from 'src/modules/api/code';
import { AppThunk, RootState, useAppDispatch, useAppSelector } from 'src/modules/store';
import { uploadObject } from 'src/modules/object-storage/utils';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import API, {
  EducationalCreateRequest,
  EducationalUpdateRequest,
  EducationalResponse,
  BlockContent,
  ItemType,
  BlockContentType,
  EducationInnerContent,
  EducationalContentStatus,
  EducationalContentType,
  ImageBlock,
  PdfContent,
  PdfContentRequest,
  ScratchContent,
  ScratchContentRequest,
  TextBlock,
  VideoBlock,
  VideoContent,
  VideoContentRequest,
  PublicationImageOption,
} from 'src/modules/api';
import { newId } from './utils';

const TITLE_ALREADY_EXISTS = 'Title already exists. Please use another title.'

API.mock.provideEndpoints({
  getFileDownloadUrls({ filePaths }) {
    const data: Record<string, string> = {
      SCRATCH: 'https://www.w3schools.com/css/img_lights.jpg',
      PDF: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf',
      VIDEO: 'https://ucsf-eureka-static-test.s3.us-east-2.amazonaws.com/flower.mp4',
    }
    const urls = filePaths.map(p => {
      if (p.includes('PDF')) return { url: data['PDF'] };
      if (p.includes('VIDEO')) return { url: data['VIDEO'] };
      return { url: data['SCRATCH'] };
    })
    return API.mock.response(urls);
  },
});

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
  children: EducationInnerContent[];
};

export interface EducationItem {
  studyId: string;
  id: string;
  title: string;
  type: EducationalContentType;
  status: EducationalContentStatus;
  category: string;
  content: PublicationContentSection[];
  attachment?: { url: string; path: string; };
}

export type EducationItemErrors = {
  id: string;
  text?: { empty?: boolean };
  images?: { empty?: boolean };
  video?: { empty?: boolean };
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
  data?: EducationItem;
};

export const educationEditorInitialState: EducationEditorState = {
  isSaving: false,
  isLoading: false,
};

export const educationEditorSlice = createSlice({
  name: 'education/educationEditor',
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
    setEducation(state, action: PayloadAction<EducationItem | undefined>) {
      state.data = action.payload;
    },
    setEducationErrors(state, action: PayloadAction<EducationEditorErrors>) {
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
  setEducation,
  setEducationErrors,
  clearTransientState,
  updateLastTouched,
  reset,
} = educationEditorSlice.actions;

export const editedEducationSelector = (state: RootState) =>
  state[educationEditorSlice.name].data ||
  ({
    studyId: '',
    id: '',
    type: '' as EducationalContentType,
    status: '' as EducationalContentStatus,
    title: '',
    category: '',
    content: [],
  } as EducationItem);
export const educationEditorIsSavingSelector = (state: RootState) =>
  state[educationEditorSlice.name].isSaving;
export const educationEditorIsLoadingSelector = (state: RootState) =>
  state[educationEditorSlice.name].isLoading;
const educationEditorEducationErrorsSelector = (state: RootState) =>
  state[educationEditorSlice.name].errors;

export const educationEditorIsFailedConnectionSelector = (state: RootState) =>
  state[educationEditorSlice.name].isFailedConnection;
export const educationEditorLastTouchedSelector = (state: RootState) =>
  state[educationEditorSlice.name].lastTouchedOn;
const educationSavedOnSelector = (state: RootState) => state[educationEditorSlice.name].savedOn;

const getEducationErrors = ({
  item: s,
  currentErrors: cur,
}: {
  item: EducationItem;
  currentErrors?: EducationEditorErrors;
}, options?: { isPublish?: boolean }): EducationEditorErrors => {
  if (cur) {
    return {
      title: { empty: cur.title.empty && !s.title },
      category: { empty: cur.category.empty && !s.category },
      attachment: { empty: cur.attachment.empty && !s.attachment },
      items: [],
    };
  }

  return {
    title: { empty: !s.title },
    category: { empty: !s.category },
    attachment: { empty: !s.attachment },
    items: [],
  };
};

const hasEducationTitleErrors = (se: EducationEditorErrors) => !!se.title.empty;
const hasEducationCategoryErrors = (se: EducationEditorErrors) => !!se.category.empty;
const hasEducationAttachmentErrors = (se: EducationEditorErrors) => !!se.attachment.empty;
export const hasEducationItemsErrors = (qe: EducationItemErrors) =>
  !!qe.text?.empty || !!qe.images?.empty;
export const hasSomeEducationErrors = (se: EducationEditorErrors) =>
  hasEducationTitleErrors(se) ||
  hasEducationCategoryErrors(se) ||
  hasEducationAttachmentErrors(se) ||
  se.items.some(hasEducationItemsErrors);

const updateEducation = (education: EducationItem): AppThunk =>
  (dispatch, getState) => {
    const activityErrors = educationEditorEducationErrorsSelector(getState());

    dispatch(setEducation(education));
    dispatch(updateLastTouched());
    activityErrors &&
      dispatch(
        setEducationErrors(
          getEducationErrors({
            item: education,
            currentErrors: activityErrors,
          })
        )
      );
  };

export const uploadAttachmentIfNeeded = async (education: EducationItem) => {
  const { studyId, type, attachment } = education;

  if (!attachment || !!attachment?.path) return education;
  const { url } = attachment;
  const path = `education_${type}_${_uniqueId()}`;

  const blobFile = (await API.getBlobFile(url)).data;
  const fileUpload = new File([blobFile], studyId, { type: blobFile.type });
  await uploadObject({ studyId: studyId, name: path, blob: fileUpload });

  return {
    ...education,
    attachment: {
      ...attachment,
      path,
    },
  };
};

const transformItem = (blocks: BlockContent[]) =>
  blocks.map((block) => {
    switch (block.type) {
      case 'TEXT':
        return {
          id: block.id,
          type: block.type,
          sequence: block.sequence,
          text: block.text,
        } as TextBlock;
      case 'IMAGE':
        return {
          id: block.id,
          type: block.type,
          sequence: block.sequence,
          images: block.images
            .filter((i) => i.touched)
            .map((i) => ({ id: i.id, url: i.path, caption: i.caption })),
        } as ImageBlock;
      case 'VIDEO':
        return {
          id: block.id,
          type: block.type,
          sequence: block.sequence,
          url: block.path,
          text: block.text,
        } as VideoBlock;
    }
  });

export const transformEducationToApi = (data: EducationItem) => {
  const {
    attachment,
    content: [{ children }],
    type,
  } = data;

  const updatedContent =
    type !== 'SCRATCH'
      ? { url: attachment?.path, description: (children?.[0] as PdfContent | VideoContent).text }
      : {
        ...children?.[0],
        coverImage: attachment?.path,
        blocks: transformItem((children?.[0] as ScratchContent).blocks),
      };

  return {
    title: data.title,
    type: data.type,
    status: data.status,
    category: data.category,
    content: updatedContent,
  };
};

export const createEducation = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { isSaving, data } = getState()[educationEditorSlice.name];

  if (!data || !data?.studyId || isSaving) {
    return;
  }

  try {
    dispatch(savingStarted());

    const education = await uploadAttachmentIfNeeded(data);
    const educationCreate = transformEducationToApi(education) as EducationalCreateRequest;

    const res = await API.createEducation({ studyId: data.studyId }, educationCreate);

    if (res.status === HTTP_CODE_CONFLICT) {
      dispatch(savingFinished({ error: true }));
      dispatch(showSnackbar({ text: TITLE_ALREADY_EXISTS, showErrorIcon: true }));
      return;
    };

    res.checkError();
    dispatch(savingFinished({ error: false }));

    if (!res.data?.id)
      dispatch(push(generatePath(Path.EducationalManagement)));
    else
      dispatch(push(generatePath(Path.EditEducational, { educationId: res.data.id })));
  } catch (err) {
    dispatch(savingFinished({ error: true, isFailedConnection: true }));
  }
};

export const saveEducationContent = (): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { isSaving, data } = getState()[educationEditorSlice.name];

    if (!data || !data?.studyId || !data?.id || isSaving) {
      return;
    }

    try {
      dispatch(savingStarted());

      const education = await uploadAttachmentIfNeeded(data);
      const educationUpdate = transformEducationToApi(education) as EducationalUpdateRequest;

      const res = await API.updateEducation({ studyId: data?.studyId, educationId: data.id }, educationUpdate);
      res.checkError();

      dispatch(savingFinished({ error: false }));
    } catch (err) {
      dispatch(savingFinished({ error: true, isFailedConnection: true }));
    }
  };

const createNewEmptyBlock = (type: BlockContentType, sequence: number) => {
  switch (type) {
    case 'TEXT':
      return {
        id: newId(),
        text: '',
        type: 'TEXT',
        sequence,
      };
    case 'IMAGE':
      return {
        id: newId(),
        type: 'IMAGE',
        images: [
          {
            id: newId(),
            url: '',
            path: '',
            caption: '',
            touched: true,
          },
          {
            id: newId(),
            url: '',
            path: '',
            caption: '',
            touched: false,
          },
        ],
        text: '',
        sequence,
      };
    case 'VIDEO':
      return {
        id: newId(),
        type: 'VIDEO',
        touched: false,
        url: '',
        path: '',
        text: '',
        sequence,
      };
  }
};
const newEducationContent = (sourceType: EducationalContentType): PublicationContentSection => {
  let transformedContent;
  switch (sourceType) {
    case 'PDF':
      transformedContent = {
        id: newId(),
        children: [
          {
            id: newId(),
            url: '',
            text: '',
            type: 'TEXT',
          } as PdfContent,
        ],
      };
      break;
    case 'VIDEO':
      transformedContent = {
        id: newId(),
        children: [
          {
            id: newId(),
            url: '',
            text: '',
            type: 'TEXT',
          } as VideoContent,
        ],
      };
      break;
    case 'SCRATCH':
      transformedContent = {
        id: newId(),
        children: [
          {
            id: newId(),
            coverImage: '',
            description: '',
            blocks: [
              {
                id: newId(),
                sequence: 0,
                type: 'TEXT',
                text: ''
              }
            ],
          } as ScratchContent,
        ],
      };
      break;
    default:
      transformedContent = undefined;
  }
  return transformedContent as PublicationContentSection;
};
const newEducation = (
  sourceType: EducationalContentType
): Omit<EducationItem, 'id' | 'studyId'> => ({
  title: '',
  type: sourceType,
  status: 'DRAFT',
  category: '',
  content: [newEducationContent(sourceType)],
});
export const generateEducation =
  ({
    studyId,
    sourceType,
  }: {
    studyId: string;
    sourceType: EducationalContentType;
  }): AppThunk<Promise<void>> =>
    async (dispatch) => {
      dispatch(loadingStarted());
      const education = newEducation(sourceType);
      const transformedEducation = { ...education, studyId, id: '' };
      dispatch(setEducation(transformedEducation));
      dispatch(clearTransientState());
      dispatch(loadingFinished());
    };

const getUrl = async (data: EducationalResponse, studyId: string) => {
  let paths = [];
  if (data.type === 'SCRATCH') {
    const educationContent = data.content as ScratchContentRequest;
    paths.push(educationContent.coverImage);

    educationContent.blocks.forEach((item) => {
      if (item.type === 'IMAGE')
        item.images.forEach((img) => {
          img.url && paths.push(img.url);
        });
      else if (item.type === 'VIDEO') item.url && paths.push(item.url);
    });
  } else {
    const educationContent = data.content as PdfContentRequest | VideoContentRequest;
    paths.push(educationContent.url);
  }

  const { data: urls } = await API.getFileDownloadUrls({ studyId, filePaths: paths });
  const pathUrl = paths.reduce(
    (data, path, idx) => ({
      ...data,
      [path]: urls[idx].url,
    }),
    {}
  );
  return pathUrl;
};
const transformEducationFromApi = async (data: EducationalResponse, studyId: string, educationId: string) => {
  const urlsData = (await getUrl(data, studyId)) as Record<string, string>;

  let attachment, children;
  if (data.type === 'SCRATCH') {
    const content = data.content as ScratchContentRequest;
    const path = content.coverImage;
    const blocks = content.blocks.map((b) => {
      if (b.type === 'IMAGE') {
        const images = b.images.map((img) => ({ ...img, path: img.url, url: urlsData[img.url] || '', touched: true }));
        images.push({
          id: newId(),
          url: '',
          path: '',
          caption: '',
          touched: false,
        })
        return { ...b, images };
      } else if (b.type === 'VIDEO') {
        return { ...b, path: b.url, url: urlsData[b.url] || '', touched: !!b.url };
      } else {
        return b;
      }
    });
    attachment = { path, url: urlsData[path] };
    children = [
      {
        id: _uniqueId(),
        ...content,
        blocks,
      },
    ];
  } else {
    const content = data.content as PdfContentRequest | VideoContentRequest;
    const path = content.url;
    attachment = { path, url: urlsData[path] };
    children = [
      {
        id: _uniqueId(),
        ...content,
        text: content.description,
      },
    ];
  }
  return {
    studyId,
    id: data.id || educationId,
    title: data.title,
    type: data.type,
    status: data.status,
    category: data.category,
    attachment,
    content: [
      {
        id: _uniqueId(),
        children,
      },
    ],
  } as EducationItem;
};

export const loadEducationContent = ({
  studyId,
  educationId,
  onError,
}: {
  studyId: string;
  educationId: string;
  onError: () => void;
}): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(loadingStarted());

      const { data } = await API.getEducation({ studyId, educationId: educationId });

      const education = await transformEducationFromApi(data, studyId, educationId);

      dispatch(setEducation(education));
      dispatch(clearTransientState());
    } catch (err) {
      onError();
    } finally {
      dispatch(loadingFinished());
    }
  };

export const createEducationContent = ({ educationType }: { educationType: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(push(generatePath(Path.CreateEducational, { educationType })));
  };
export const editEducationContent = ({ educationId }: { educationId: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(push(generatePath(Path.EditEducational, { educationId })));
  };

export const useEducationEditor = () => {
  const dispatch = useAppDispatch();
  const education = useAppSelector(editedEducationSelector);
  const errors = useAppSelector(educationEditorEducationErrorsSelector);
  const isLoading = useAppSelector(educationEditorIsLoadingSelector);
  const isSaving = useAppSelector(educationEditorIsSavingSelector);
  const savedOn = useAppSelector(educationSavedOnSelector);
  const isFailedConnection = useAppSelector(educationEditorIsFailedConnectionSelector);
  const lastTouchedOn = useAppSelector(educationEditorLastTouchedSelector);

  const resetAll = useCallback(() => dispatch(reset()), [dispatch]);

  const set = useCallback(
    (a: EducationItem) => {
      dispatch(updateEducation(a));
    },
    [dispatch]
  );
  const setPartialEducation = useCallback(
    (a: Partial<EducationItem>) => {
      set({ ...education, ...a } as EducationItem);
    },
    [education, set]
  );

  const validateEducation = useCallback((options?: { isPublish?: boolean }) => {
    const se = getEducationErrors({ item: education }, options);
    dispatch(setEducationErrors(se));
    return se;
  }, [education, dispatch]);

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
      if (!isLoading && educationId !== education?.id) {
        dispatch(loadEducationContent({ studyId, educationId, onError }));
      }
    },
    [dispatch]
  );

  const generate = useCallback(
    ({ studyId, sourceType }: { studyId: string; sourceType: EducationalContentType }) => {
      dispatch(generateEducation({ studyId, sourceType }));
    },
    [dispatch]
  );

  const addItem = useCallback(
    (type: BlockContentType) => {
      const {
        content: [{ id, children }],
      } = education;
      const transformedEducation = {
        ...education,
        content: [
          {
            id,
            children: [
              {
                ...children[0],
                blocks: [
                  ...(children[0] as ScratchContent).blocks,
                  createNewEmptyBlock(type, (children[0] as ScratchContent)?.blocks.length),
                ],
              },
            ],
          },
        ],
      } as EducationItem;
      set(transformedEducation);
    },
    [set, education]
  );

  const removeBlock = useCallback(
    (block: ItemType) => {
      const { content: [{ id, children }] } = education;
      const transformedEducation = {
        ...education,
        content: [
          {
            id,
            children: [
              {
                ...children[0],
                blocks: (children[0] as ScratchContent).blocks.filter((blk) => blk.id !== block.id),
              },
            ],
          },
        ],
      } as EducationItem;
      set(transformedEducation);
    },
    [set, education]
  );

  const updateBlock = useCallback(
    (block: ItemType) => {
      const {
        content: [{ id, children }],
      } = education;
      const transformedEducation = {
        ...education,
        content:
          education.type === 'SCRATCH'
            ? [
              {
                id,
                children: [
                  {
                    ...children[0],
                    blocks: (children[0] as ScratchContent).blocks.map((blk) =>
                      blk.id === block.id ? { ...blk, ...block } : { ...blk }
                    ),
                  },
                ],
              },
            ]
            : [{ id, children: [{ ...block }] }],
      } as EducationItem;
      set(transformedEducation);
    },
    [education, set]
  );

  const saveEducation = useCallback(async () => {
    if (!education?.id) {
      await dispatch(createEducation())
    } else {
      await dispatch(saveEducationContent())
    }
  }, [education, dispatch]);

  return {
    education,
    errors,
    isLoading,
    isSaving,
    savedOn,
    lastTouchedOn,
    isFailedConnection,
    setEducation: set,
    addItem,
    updateBlock,
    removeBlock,
    validateEducation,
    loadEducation: load,
    generateEducation: generate,
    updateEducation: setPartialEducation,
    saveEducation,
    reset: resetAll,
  };
};

export default {
  [educationEditorSlice.name]: educationEditorSlice.reducer,
};
