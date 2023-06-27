import {
  deleteStorageObject,
  downloadObject,
  getObjectDownloadUrl,
  getObjectUrl,
  listObjects,
  mockStorageObjects,
  uploadObject,
} from './utils';

const studyId = 'test_study';

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
    ).resolves.toBeUndefined();
  });

  it('should return object url if object exists', async () => {
    mockStorageObjects.push({
      name: 'test',
      blob: new Blob(),
    });
    const url = await getObjectUrl({
      studyId,
      name: 'test',
    });

    expect(typeof url).toEqual('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('[NEGATIVE] should throw error on get object url if object does not exist', async () => {
    await expect(
      getObjectUrl({
        studyId,
        name: 'not_exist',
      })
    ).rejects.toThrow();
  });

  it('should download object', async () => {
    mockStorageObjects.push({
      name: 'test',
      blob: new Blob(),
    });
    await expect(
      downloadObject({
        studyId,
        name: 'test',
      })
    ).resolves.toBeUndefined();
  });

  it('[NEGATIVE] should throw error on download object if object does not exist', async () => {
    await expect(
      downloadObject({
        studyId,
        name: 'test',
      })
    ).rejects.toThrow();
  });

  it('should list object', async () => {
    mockStorageObjects.push({
      name: 'p1/test',
      blob: new Blob(),
    });
    mockStorageObjects.push({
      name: 'p1/test2',
      blob: new Blob(),
    });

    await expect(
      listObjects({
        studyId,
        path: 'p1',
      })
    ).resolves.toEqual([
      {
        name: 'p1/test',
        sizeBytes: expect.any(Number),
      },
      {
        name: 'p1/test2',
        sizeBytes: expect.any(Number),
      },
    ]);
  });

  it('[NEGATIVE] should return empty list of no objects', async () => {
    await expect(
      listObjects({
        studyId,
        path: 'p1',
      })
    ).resolves.toEqual([]);
  });

  it('should get object download url', async () => {
    mockStorageObjects.push({
      name: 'test',
      blob: new Blob(),
    });
    const url = await getObjectDownloadUrl({
      studyId,
      name: 'test',
    });
    expect(typeof url).toEqual('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('[NEGATIVE] should throw error on get object download url if object does not exist', async () => {
    await expect(
      getObjectDownloadUrl({
        studyId,
        name: 'test',
      })
    ).rejects.toThrow();
  });

  it('should delete object', async () => {
    mockStorageObjects.push({
      name: 'test',
      blob: new Blob(),
    });
    await expect(
      deleteStorageObject({
        studyId,
        name: 'test',
      })
    ).resolves.toBeUndefined();
  });

  it('[NEGATIVE] should throw error on delete object if object does not exist', async () => {
    await expect(
      deleteStorageObject({
        studyId,
        name: 'test',
      })
    ).rejects.toThrow();
  });
});
