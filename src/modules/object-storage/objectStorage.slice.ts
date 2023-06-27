import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import React, { useContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppThunk,
  RootState,
  useAppDispatch,
  useAppSelector,
  WithLoading,
} from 'src/modules/store';
import { useSelectedStudyId } from '../studies/studies.slice';
import { getObjectDownloadUrl, deleteStorageObject, getObjectUrl, uploadObject } from './utils';

type ObjectUrlCacheRecord = WithLoading & {
  contextId: string;
  studyId: string;
  name: string;
  url?: string;
};

type ObjectStorageState = {
  cacheByName: Record<string, ObjectUrlCacheRecord>;
};

const objectStorageInitialState: ObjectStorageState = {
  cacheByName: {},
};

const objectStorageSlice = createSlice({
  name: 'objectStorage',
  initialState: objectStorageInitialState,
  reducers: {
    setCacheRecord(state, { payload }: PayloadAction<ObjectUrlCacheRecord>) {
      state.cacheByName[payload.name] = payload;
    },
  },
});

const cacheByNameSelector = createSelector(
  (state: RootState) => state.objectStorage,
  (s) => s.cacheByName
);

const { setCacheRecord } = objectStorageSlice.actions;

const resolveObjectUrl =
  ({ studyId, contextId, name }: { studyId: string; contextId: string; name: string }): AppThunk =>
  async (dispatch, getState) => {
    if (cacheByNameSelector(getState())[name]) {
      return;
    }

    dispatch(
      setCacheRecord({
        contextId,
        studyId,
        name,
        isLoading: true,
      })
    );

    try {
      const url = await getObjectUrl({ studyId, name });
      dispatch(
        setCacheRecord({
          contextId,
          studyId,
          name,
          isLoading: false,
          url,
        })
      );
    } catch (err) {
      console.error(`Failed to load object ${name}`, err);
      dispatch(
        setCacheRecord({
          contextId,
          studyId,
          name,
          isLoading: false,
          error: String(err),
        })
      );
    }
  };

export const ObjectUrlCacheContext = React.createContext<{
  cacheContextId?: string;
}>({});

export function useResolveUrlOrObjectPath(urlOrPath: string) {
  const isObjectPath = useMemo(
    () =>
      !urlOrPath.startsWith('http') &&
      !urlOrPath.startsWith('blob') &&
      !urlOrPath.startsWith('data'),
    [urlOrPath]
  );

  const cacheEntry = useAppSelector(cacheByNameSelector)[urlOrPath];
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();

  const contextId = useContext(ObjectUrlCacheContext)?.cacheContextId || '';

  useEffect(() => {
    if (!urlOrPath || !isObjectPath || !studyId) {
      return;
    }
    dispatch(
      resolveObjectUrl({
        studyId,
        contextId,
        name: urlOrPath,
      })
    );
  }, [urlOrPath, isObjectPath, studyId, contextId, dispatch]);

  return {
    url: isObjectPath ? cacheEntry?.url || '' : urlOrPath,
    isLoading: !!cacheEntry?.isLoading,
    error: cacheEntry?.error,
  };
}

type UploadObjectParams = {
  path: string;
  file: File;
  generateDownloadUrl?: boolean;
  downloadUrlExpiresAfterMs?: number;
};

export function useUploadObject() {
  const [uploadState, setUploadState] = useState<{ isSending: boolean; error: string | undefined }>(
    {
      isSending: false,
      error: undefined,
    }
  );
  const studyId = useSelectedStudyId();

  const upload = useCallback(
    async ({
      path,
      file,
      generateDownloadUrl,
      downloadUrlExpiresAfterMs,
    }: UploadObjectParams): Promise<{ url?: string; err?: string }> => {
      try {
        if (!studyId) {
          throw new Error('No studyId provided');
        }
        if (uploadState.isSending) {
          throw new Error(`Tried to upload object ${path} while already uploading`);
        }
        setUploadState({
          isSending: true,
          error: undefined,
        });
        await uploadObject({
          studyId,
          name: path,
          blob: file,
        });
        let url: string | undefined;
        if (generateDownloadUrl) {
          url = await getObjectDownloadUrl({
            studyId,
            name: path,
            expiresAfterMs: downloadUrlExpiresAfterMs,
          });
        }
        setUploadState({
          isSending: false,
          error: undefined,
        });
        return {
          url,
        };
      } catch (err) {
        setUploadState({
          isSending: false,
          error: String(err),
        });
        return {
          err: String(err),
        };
      }
    },
    [uploadState, studyId]
  );

  return { ...uploadState, upload };
}

export function useDeleteStorageObject() {
  const [deleteState, setDeleteState] = useState<{ isDeleting: boolean; error?: string }>({
    isDeleting: false,
  });
  const studyId = useSelectedStudyId();

  const remove = useCallback(
    async (name: string) => {
      try {
        if (!studyId) {
          return false;
        }
        if (deleteState.isDeleting) {
          console.error(`Tried to delete object '${name}' while already deleting`);
          return false;
        }
        setDeleteState({
          isDeleting: true,
          error: undefined,
        });
        await deleteStorageObject({ studyId, name });
        setDeleteState({
          isDeleting: false,
          error: undefined,
        });
        return true;
      } catch (e) {
        setDeleteState({
          isDeleting: false,
          error: String(e),
        });
        return false;
      }
    },
    [studyId, deleteState]
  );

  return {
    ...deleteState,
    remove,
  };
}

export default {
  [objectStorageSlice.name]: objectStorageSlice.reducer,
};
