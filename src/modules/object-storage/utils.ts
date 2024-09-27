import _isString from 'lodash/isString';
import API from 'src/modules/api';

export const mockStorageObjects: {
  name: string;
  blob: Blob;
}[] = [];

API.mock.provideEndpoints({
  getUploadUrl() {
    return API.mock.response({
      presignedUrl: "https://mock/presignedUrl",
    });
  },
  uploadStorageObject({ signedUrl, blob }) {
    mockStorageObjects.push({
      name: signedUrl,
      blob,
    });
    return API.mock.response(undefined);
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
}): Promise<string | undefined> {
  const getRes = await API.getUploadUrl({ studyId }, { filePath: name });
  const { presignedUrl, headers } = getRes.data;
  if (!presignedUrl || !_isString(presignedUrl)) {
    throw new Error(`Failed to get upload url for ${name}`);
  }

  try {
    const uploadRes = await API.uploadStorageObject({ signedUrl: presignedUrl, blob }, headers);
    uploadRes.checkError();
    return name;
  } catch (err) {
    throw new Error(`Failed to get upload file`);
  }
}

export async function getObjectDownloadUrl({
  studyId,
  name,
}: {
  studyId: string;
  name: string;
}) {
  try {
    const res = await API.getFileDownloadUrls({
      studyId,
      filePaths: [name],
    });
    res.checkError();
    return res.data[0]?.url;
  } catch (err) {
    throw new Error(`Failed to get download url`);
  }
}

export type ObjectInfo = {
  name: string;
  sizeBytes: number;
};

