import { checkFileExistOrThrowError, getFilenameInfo } from './utils';

describe('getFilenameInfo', () => {
  it('should return correct info for fileName without extension', () => {
    const result = getFilenameInfo('validFileName');
    expect(result.fullName).toBe('validFileName');
    expect(result.name).toBe('validFileName');
    expect(result.extension).toBeUndefined();
  });

  it('should return correct info for fileName with extension', () => {
    const result = getFilenameInfo('validFileName.ext');
    expect(result.fullName).toBe('validFileName.ext');
    expect(result.name).toBe('validFileName');
    expect(result.extension).toBe('ext');
  });

  it('[NEGATIVE] should return undefined for empty fileName', () => {
    const result = getFilenameInfo('');
    expect(result.fullName).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.extension).toBeUndefined();
  });
});

describe('checkFileExistOrThrowError', () => {
    it('should pass the function without exception', () => {
        const validFile = new File([], 'filename.txt');
    
        expect(() => {
          checkFileExistOrThrowError(validFile);
        }).not.toThrow();
      });
    it('[NEGATIVE] throws an error if file is not an instance of File', () => {
      const invalidFile = 'not a file';
  
      expect(() => {
        checkFileExistOrThrowError(invalidFile as unknown as File);
      }).toThrow('File does not exist');
    });
  });
