import { downloadFile, downloadFileByUrl } from './file';

const responseData = { blob: null };

const testUrl = 'https://test';
const testFileName = 'test.txt';

function mockFetch() {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: {},
      blob: () => Promise.resolve(responseData),
      json: () => Promise.resolve(responseData),
    })
  ) as unknown as typeof fetch;
}

describe('downloadFile util', () => {
  it('should download file', () => {
    const element = document.createElement('a');
    jest.spyOn(document, 'createElement').mockReturnValueOnce(element);
    const setHrefSpy = jest.spyOn(element, 'href', 'set');
    const setDownloadSpy = jest.spyOn(element, 'download', 'set');
    const clickSpy = jest.spyOn(element, 'click');

    const createObjectUrlMock = jest.fn();
    global.URL.createObjectURL = createObjectUrlMock;
    createObjectUrlMock.mockReturnValueOnce('blob url');

    const blob = new Blob();
    downloadFile(testFileName, blob);
    expect(setHrefSpy).toHaveBeenCalledOnceWith('blob url');
    expect(setDownloadSpy).toHaveBeenCalledOnceWith(testFileName);
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('[NEGATIVE] should throw error when download called with null blob', () => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    expect(() => downloadFile('error.txt', null as unknown as Blob)).toThrow();
  });

  it('[NEGATIVE] should throw error when download called with invalid blob', () => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    expect(() => downloadFile('error.txt', {} as unknown as Blob)).toThrow();
  });

  it('[NEGATIVE] should throw error when download called with undefined blob', () => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    expect(() => downloadFile('error.txt', {} as unknown as Blob)).toThrow();
  });
});

describe('downloadFileByUrl util', () => {
  beforeAll(() => {
    mockFetch();
  });

  it('should download file', async () => {
    const element = document.createElement('a');
    jest.spyOn(document, 'createElement').mockReturnValueOnce(element);
    const setDownloadSpy = jest.spyOn(element, 'download', 'set');

    global.URL.createObjectURL = jest.fn();

    await downloadFileByUrl(testUrl, testFileName);
    expect(setDownloadSpy).toHaveBeenCalledOnceWith(testFileName);
  });
});
