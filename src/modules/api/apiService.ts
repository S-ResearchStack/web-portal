import { HTTP_STATUS_UNAUTHORIZED } from './code';
import executeRequest, { RequestOptions, Response } from './executeRequest';

type AuthProvider = {
  getTokenType(): string | undefined;
  getBearerToken(): string | undefined;
  onUnauthorizedError(): void;
  refreshBearerToken(): Promise<void>;
};

let authProvider: AuthProvider | undefined;

export const ERROR_BASE_URL = 'Base API url is not set';

export const setAuthProvider = (ap: AuthProvider) => {
  authProvider = ap;
};

let waitTokenUpdateIfNeeded: Promise<void> | undefined;

export const request = async <TReq, TRes>(
  opts: Omit<RequestOptions<TReq>, 'url'> & {
    skipTokenUpdate?: boolean;
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

  if (!opts.noAuth && waitTokenUpdateIfNeeded) {
    await waitTokenUpdateIfNeeded;
  }

  const { headers = {} } = opts;
  const jwtType = authProvider?.getTokenType();
  const bearerToken = authProvider?.getBearerToken();
  if (!opts.noAuth && jwtType && bearerToken) {
    headers['jwt-issuer'] = jwtType;
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  let res = await executeRequest<TReq, TRes>({
    ...opts,
    url: `${baseUrl}${opts.path}`,
    headers,
  });

  if (!opts.noAuth && res.status === HTTP_STATUS_UNAUTHORIZED && authProvider) {
    if (waitTokenUpdateIfNeeded) {
      await waitTokenUpdateIfNeeded;
    } else if (!opts.skipTokenUpdate) {
      try {
        waitTokenUpdateIfNeeded = authProvider.refreshBearerToken();
        await waitTokenUpdateIfNeeded;
      } catch {
        authProvider.onUnauthorizedError();
      } finally {
        waitTokenUpdateIfNeeded = undefined;
      }

      res = await request<TReq, TRes>({ ...opts, skipTokenUpdate: true });
    }

    if (opts.skipTokenUpdate && res.status === HTTP_STATUS_UNAUTHORIZED) {
      authProvider.onUnauthorizedError();
    }
  }

  return res;
};

export const supersetRequest = async <TReq, TRes>(
  opts: Omit<RequestOptions<TReq>, 'url'> & {
    path: string;
    bearerToken?: string;
  }
): Promise<Response<TRes>> => {
  const baseUrl = (localStorage.getItem('SUPERSET_URL') || process.env.SUPERSET_URL)

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

  if (opts.bearerToken) {
    headers.Authorization = `Bearer ${opts.bearerToken}`;
  }

  const res = await executeRequest<TReq, TRes>({
    ...opts,
    url: `${baseUrl}${opts.path}`,
    headers,
  });

  return res;
};
