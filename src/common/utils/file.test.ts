import { downloadFile } from './file';

describe('file util', () => {
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
    downloadFile('test.txt', blob);
    expect(setHrefSpy).toHaveBeenCalledOnceWith('blob url');
    expect(setDownloadSpy).toHaveBeenCalledOnceWith('test.txt');
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
