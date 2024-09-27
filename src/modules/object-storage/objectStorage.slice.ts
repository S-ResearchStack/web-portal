import { useCallback, useState } from 'react';
import { useSelectedStudyId } from '../studies/studies.slice';
import { uploadObject, getObjectDownloadUrl } from './utils';

type UploadObjectParams = {
  path: string;
  file: File;
  generateDownloadUrl?: boolean;
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
    }: UploadObjectParams): Promise<{ downloadUrl?: string; err?: string }> => {
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
        let downloadUrl: string | undefined;
        if (generateDownloadUrl) {
          downloadUrl = await getObjectDownloadUrl({
            studyId,
            name: path,
          });
        }
        setUploadState({
          isSending: false,
          error: undefined,
        });
        return {
          downloadUrl,
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
