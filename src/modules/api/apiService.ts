import executeRequest, { RequestOptions, Response } from './executeRequest';

type AuthProvider = {
  getBearerToken(): string | undefined;
  onUnauthorizedError(): void;
};

let authProvider: AuthProvider | undefined;

export const ERROR_BASE_URL = 'Base API url is not set';

export const setAuthProvider = (ap: AuthProvider) => {
  authProvider = ap;
};

export const request = async <TReq, TRes>(
  opts: Omit<RequestOptions<TReq>, 'url'> & {
    noAuth?: boolean;
    path: string;
  }
): Promise<Response<TRes>> => {
  const baseUrl = localStorage.getItem('API_URL') || process.env.API_URL;

  if (!baseUrl) {
    const err = new Error(ERROR_BASE_URL);
    console.error(err);
    return {
      status: -1,
      error: err.message,
      headers: new Headers(),
      get data(): never {
        throw err;
      },
      checkError() {
        throw err;
      },
    };
  }

  const { headers = {} } = opts;
  const bearerToken = authProvider?.getBearerToken();
  if (!opts.noAuth && bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  const res = await executeRequest<TReq, TRes>({
    ...opts,
    url: `${baseUrl}${opts.path}`,
    headers,
  });

  if (!opts.noAuth && res.status === 401) {
    authProvider?.onUnauthorizedError();
  }

  return res;
};
