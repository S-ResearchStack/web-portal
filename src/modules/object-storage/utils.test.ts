import { mockStorageObjects,  uploadObject } from './utils';
import API from 'src/modules/api';

const studyId = 'test_study';

const setPresignedUrlEmpty = () => {
  API.mock.provideEndpoints({
    getUploadUrl() {
      return API.mock.response({
        presignedUrl: '',
      });
    },
  });
};

const getStorageObjectUploadUrlError = () => {
  API.mock.provideEndpoints({
    getUploadUrl() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

const uploadStorageObjectError = () => {
  API.mock.provideEndpoints({
    getUploadUrl() {
      return API.mock.response({
        presignedUrl: 'https://mock/presignedUrl',
      });
    },
    uploadStorageObject() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

describe('object storage utils', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => 'mock_obj_url');

    mockStorageObjects.splice(0, mockStorageObjects.length);
  });

  it('should upload object', async () => {
    await expect(
      uploadObject({
        studyId,
        name: 'upload',
        blob: new File([new Blob()], 'f'),
      })
    ).resolves.toBe('upload');
  });

  it('[NEGATIVE] upload object but receive empty presignUrl', async () => {
    setPresignedUrlEmpty();
    await expect(
      uploadObject({
        studyId,
        name: 'name',
        blob: new File([new Blob()], 'f'),
      })
    ).rejects.toThrow('Failed to get upload url for name');
  });

  it('[NEGATIVE] upload object but fail to get upload url', async () => {
    getStorageObjectUploadUrlError();
    await expect(
      uploadObject({
        studyId,
        name: 'name',
        blob: new File([new Blob()], 'f'),
      })
    ).rejects.toThrow('Status code 400');
  });

  it('[NEGATIVE] return error if upload object fail', async () => {
    uploadStorageObjectError();
    await expect(
      uploadObject({
        studyId,
        name: 'name',
        blob: new File([new Blob()], 'f'),
      })
    ).rejects.toThrow('Failed to get upload file');
  });
});
