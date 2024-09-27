import API from 'src/modules/api';
import { makeStore } from '../store/store';
import { executeDownload, getFileDownloadUrl, getFileDownloadUrls } from './fileDownload';

const setDownloadUrl = () => {
  API.mock.provideEndpoints({
    getFileDownloadUrls() {
      return API.mock.response([{ url: 'https://url.com' }]);
    },
  });
};

const setDownloadUrlError = () => {
  API.mock.provideEndpoints({
    getFileDownloadUrls() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

const studyId = 'testId';
const filePath = 'path';
const filePaths = ['path1', 'path2'];

const store = makeStore();

describe('getFileDownloadUrl', () => {
  it('should return a download URL', async () => {
    setDownloadUrl();
    const urlResponse = await store.dispatch(getFileDownloadUrl(studyId, filePath) as any);
    expect(urlResponse).toContain('https://');
    executeDownload(urlResponse);
  });

  it('[NEGATIVE] API getDownloadUrls return error', async () => {
    setDownloadUrlError();
    const urlResponse = await store.dispatch(getFileDownloadUrl(studyId, filePath) as any);
    expect(urlResponse).toBeUndefined();
  });
});

describe('getFileDownloadUrls', () => {
  it('should return list download URL', async () => {
    setDownloadUrl();
    const urlResponse = await store.dispatch(getFileDownloadUrls(studyId, filePaths) as any);
    expect(urlResponse).not.toBeEmpty();
  });

  it('[NEGATIVE] API getDownloadUrls return error', async () => {
    setDownloadUrlError();
    const urlResponse = await store.dispatch(getFileDownloadUrls(studyId, filePaths) as any);
    expect(urlResponse).toBeEmpty();
  });
});
