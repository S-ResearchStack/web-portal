import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useCallback, useEffect, useState } from 'react';

import {
  AppThunk,
  ErrorType,
  RootState,
  useAppDispatch,
  useAppSelector,
  WithData,
  WithSending,
} from 'src/modules/store';
import waitFor from 'src/common/utils/waitFor';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import _random from 'lodash/random';

type FileKey = string;

interface FileItem {
  url?: string;
}

interface FileUploadItem extends WithSending, WithData<FileItem> {
  uses: number;
}

interface FileUploadState {
  [key: FileKey]: FileUploadItem;
}

const fileUploadInitialState: FileUploadState = {};

const fileUploadSlice = createSlice({
  name: 'fileUpload',
  initialState: fileUploadInitialState,
  reducers: {
    addUploader(state, { payload }: PayloadAction<{ key: FileKey }>) {
      if (!state[payload.key]) {
        state[payload.key] = { uses: 1 };
      } else {
        state[payload.key].uses += 1;
      }
    },
    removeUploader(state, { payload }: PayloadAction<{ key: FileKey }>) {
      if (state[payload.key]) {
        state[payload.key].uses -= 1;
        if (state[payload.key].uses < 1) {
          delete state[payload.key];
        }
      }
    },
    uploadFileInit(state, { payload }: PayloadAction<{ key: FileKey }>) {
      if (state[payload.key]) {
        state[payload.key].isSending = true;
        state[payload.key].error = undefined;
      }
    },
    uploadFileSuccess(state, { payload }: PayloadAction<{ key: FileKey; file: FileItem }>) {
      if (state[payload.key]) {
        state[payload.key].isSending = false;
        state[payload.key].data = payload.file;
      }
    },
    uploadFileFailure(state, { payload }: PayloadAction<{ key: FileKey; error: ErrorType }>) {
      if (state[payload.key]) {
        state[payload.key].isSending = false;
        state[payload.key].error = payload.error;
      }
    },
  },
});

export const fileUploadSelector = (state: RootState) => state[fileUploadSlice.name];

interface FileUploadParams {
  key: FileKey;
  file: File;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = (error) => reject(error);
    reader.onload = () => resolve(reader.result?.toString() || '');
  });

const fileUpload =
  ({ key, file }: FileUploadParams): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(fileUploadSlice.actions.uploadFileInit({ key }));

      await waitFor(_random(1000, 3000)); // TODO: replace to file upload logic

      // if (Math.random() > 0.7) {
      //   throw new Error('Simulate an error when uploading a file');
      // }

      const url = await fileToDataUrl(file);

      dispatch(fileUploadSlice.actions.uploadFileSuccess({ key, file: { url } }));
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      dispatch(fileUploadSlice.actions.uploadFileFailure({ key, error: String(e) }));
    }
  };

interface UseFileUploadParams {
  key: FileKey | false;
}

export const useFileUpload = ({ key: fileKey }: UseFileUploadParams) => {
  const state = useAppSelector(fileUploadSelector);
  const dispatch = useAppDispatch();

  const [key, setKey] = useState(fileKey);

  useEffect(() => {
    setKey(fileKey);
  }, [fileKey]);

  const upload = useCallback(
    async (file: File) => {
      if (key === false) {
        return;
      }

      // TODO: maybe add the AbortController?
      await dispatch(fileUpload({ key, file }));
    },
    [key, dispatch]
  );

  useEffect(() => {
    if (key === false) {
      return () => {};
    }

    dispatch(fileUploadSlice.actions.addUploader({ key }));
    // eslint-disable-next-line consistent-return
    return () => {
      dispatch(fileUploadSlice.actions.removeUploader({ key }));
    };
  }, [dispatch, key]);

  return {
    ...(key ? state[key] : {}),
    upload,
  };
};

export default {
  [fileUploadSlice.name]: fileUploadSlice.reducer,
};
