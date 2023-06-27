import _isString from 'lodash/isString';
import { downloadFile } from 'src/common/utils/file';
import API from 'src/modules/api';
import { ReadableStream } from 'web-streams-polyfill';
import downloadMultiple, {
  AbstractFilesReadableStream,
  FilesReadableFile,
} from 'src/common/utils/downloadMultiple';

export const mockStorageObjects: {
  name: string;
  blob: Blob;
}[] = [];

API.mock.provideEndpoints({
  getStorageObjects({ path }) {
    return API.mock.response(
      mockStorageObjects
        .filter(({ name }) => name.startsWith(path))
        .map((o) => ({
          name: o.name,
          size: o.blob.size,
        }))
    );
  },
  getStorageObjectUploadUrl({ objectName }) {
    return API.mock.response(objectName);
  },
  uploadStorageObject({ signedUrl, blob }) {
    mockStorageObjects.push({
      name: signedUrl,
      blob,
    });
    return API.mock.response(undefined);
  },
  async downloadStorageObject({ objectName }) {
    const obj = mockStorageObjects.find((o) => o.name === objectName);
    if (obj) {
      return API.mock.response(obj.blob);
    }
    return API.mock.failedResponse({ status: 404 });
  },
  async streamDownloadStorageObject({ objectName }) {
    const obj = mockStorageObjects.find((o) => o.name === objectName);
    if (obj) {
      return API.mock.response(obj.blob.stream());
    }
    return API.mock.failedResponse({ status: 404 });
  },
  deleteStorageObject({ objectName }) {
    const objIdx = mockStorageObjects.findIndex((o) => o.name === objectName);
    if (objIdx > -1) {
      mockStorageObjects.splice(objIdx, 1);
      return API.mock.response(undefined);
    }
    return API.mock.failedResponse({ status: 404 });
  },
  async getStorageObjectDownloadUrl({ projectId, objectName }) {
    const res = await API.downloadStorageObject({ projectId, objectName });
    return API.mock.response(URL.createObjectURL(res.data));
  },
});

export async function uploadObject({
  studyId,
  name,
  blob,
}: {
  studyId: string;
  name: string;
  blob: File;
}): Promise<void> {
  const uploadUrlRes = await API.getStorageObjectUploadUrl({
    projectId: studyId,
    objectName: name,
  });
  const uploadUrl = uploadUrlRes.data;
  if (!uploadUrl || !_isString(uploadUrl)) {
    throw new Error(`Failed to get upload url for ${name}`);
  }

  const uploadRes = await API.uploadStorageObject({
    signedUrl: uploadUrl,
    blob,
  });
  uploadRes.checkError();
}

export async function getObjectUrl({
  studyId,
  name,
}: {
  studyId: string;
  name: string;
}): Promise<string> {
  const res = await API.downloadStorageObject({
    projectId: studyId,
    objectName: name,
  });
  return URL.createObjectURL(res.data);
}

export async function downloadObject({
  studyId,
  name,
}: {
  studyId: string;
  name: string;
}): Promise<void> {
  const res = await API.downloadStorageObject({
    projectId: studyId,
    objectName: name,
  });
  downloadFile(name, res.data);
}

export type ObjectInfo = {
  name: string;
  sizeBytes: number;
};

export async function listObjects({
  studyId,
  path,
}: {
  studyId: string;
  path: string;
}): Promise<ObjectInfo[]> {
  const res = await API.getStorageObjects({
    projectId: studyId,
    path,
  });
  return res.data.map((o) => ({
    name: o.name,
    sizeBytes: o.size,
  }));
}

export async function getObjectDownloadUrl({
  studyId,
  name,
  expiresAfterMs,
}: {
  studyId: string;
  name: string;
  expiresAfterMs?: number;
}) {
  const res = await API.getStorageObjectDownloadUrl({
    projectId: studyId,
    objectName: name,
    expiresAfterSeconds: Number.isFinite(expiresAfterMs)
      ? Math.ceil((expiresAfterMs as number) / 1000)
      : undefined,
  });
  return res.data;
}

export async function downloadAllObjects({
  studyId,
  path,
  fileName,
}: {
  studyId: string;
  path: string;
  fileName?: string;
}) {
  const files = await listObjects({ studyId, path });
  const filesStream = class extends AbstractFilesReadableStream<FilesReadableFile> {
    getFilePath(file: FilesReadableFile) {
      return `${this.noSlash ? '' : '/'}${file.name.split('/').slice(-1)[0]}`;
    }

    // eslint-disable-next-line class-methods-use-this
    async getFileStream(file: FilesReadableFile): Promise<ReadableStream<Uint8Array> | null> {
      const urlResponse = await API.getStorageObjectDownloadUrl({
        projectId: studyId,
        objectName: file.name,
      });

      const fileResponse = await fetch(urlResponse.data);

      return fileResponse.body as ReadableStream<Uint8Array> | null;
    }
  };

  await (
    await downloadMultiple(
      files.map((f) => ({ ...f, size: f.sizeBytes })),
      {
        filesStream,
        fileName,
      }
    )
  ).listenOrThrow();
}

export async function deleteStorageObject({ studyId, name }: { studyId: string; name: string }) {
  const res = await API.deleteStorageObject({
    projectId: studyId,
    objectName: name,
  });
  res.checkError();
}
