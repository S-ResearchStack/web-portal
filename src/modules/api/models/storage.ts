export type StorageObjectInfo = {
  name: string;
  size: number;
};
export type GetStorageObjectsResponse = StorageObjectInfo[];

export type GetStorageObjectsParams = {
  path: string;
};

export type GetStorageObjectUploadUrlParams = {
  objectName: string;
};
export type GetStorageObjectUploadUrlResponse = string;

export type DownloadStoragetObjectParams = {
  objectName: string;
};

export type GetStorageObjectDownloadUrlParams = {
  objectName: string;
  expiresAfterSeconds?: number;
};

export type GetStorageObjectDownloadUrlResponse = string;

export type DeleteStorageObjectParams = {
  objectName: string;
};
