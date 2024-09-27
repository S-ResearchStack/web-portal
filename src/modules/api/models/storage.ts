export type GetUploadUrlParams = {
  filePath: string;
  assetType?: string;
};
export type GetStorageObjectUploadUrlResponse = {
  presignedUrl: string;
  headers?: Record<string, string>;
};

export type LoginSupersetRequest = {
  username: string,
  password: string,
  provider: string,
  refresh: boolean
}

export type LoginSupersetResponse = {
  access_token: string,
  refresh_token: string
}

export type GetSupersetGuestTokenRequest = {
  resources: [{
    id: string,
    type: string
  }],
  rls: [{
    clause: string,
    dataset?: number
  }],
  user: {
    first_name?: string,
    last_name?: string,
    username?: string
  },
};

export type GetSupersetGuestTokenResponse = {
  token: string
}
