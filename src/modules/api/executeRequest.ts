import qs from 'qs';

export type RequestOptions<TReq> = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  query?: Record<string, unknown>;
  body?: TReq;
  headers?: Record<string, string>;
  readResponseAsBlob?: boolean;
  mode?: RequestMode;
};

export type Response<TRes> = {
  status: number;
  headers: Headers;
  error?: string;
  data: TRes;
  checkError: () => void;
};

export const FAILED_CONNECTION_ERROR_TEXT = 'Server connection failed. Please try again later.';

export class FailedConnectionError extends Error {
  constructor(public originalError?: unknown) {
    super(FAILED_CONNECTION_ERROR_TEXT);
  }
}

async function executeRequest<TReq, TRes>(opts: RequestOptions<TReq>): Promise<Response<TRes>> {
  const { method = 'GET', headers = {}, query, mode, readResponseAsBlob } = opts;
  let { url } = opts;
  let body = opts.body as unknown as BodyInit;

  if (!(body instanceof FormData)) {
    const contentTypeHeader = 'Content-Type';
    if (!headers[contentTypeHeader]) {
      const isFile = body instanceof File;
      if (!isFile) {
        body = JSON.stringify(body);
        headers[contentTypeHeader] = 'application/json';
      } else {
        headers[contentTypeHeader] = (body as File).type;
      }
    }
  }

  if (query) {
    const queryString = qs.stringify(query, { indices: false });
    url = `${url}?${queryString}`;
  }

  const getFailedError = (msg: string) => new Error(`${method} ${url} Failed - ${msg}`);

  try {
    const res = await fetch(url, { mode, method, headers, body });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resBody: any;
    try {
      resBody = readResponseAsBlob ? await res.blob() : await res.json();
    } catch (e) {
      // No body
    }

    const getErrorMessage = () => {
      if (res.ok) {
        return undefined;
      }
      return (
        resBody?.reason ||
        resBody?.message ||
        resBody?.msg ||
        res.statusText ||
        `error status code ${res.status}`
      );
    };

    return {
      status: res.status,
      error: getErrorMessage(),
      headers: res.headers,
      get data() {
        if (res.ok) {
          return resBody;
        }
        throw getFailedError(getErrorMessage());
      },
      checkError() {
        if (!res.ok) {
          throw getFailedError(getErrorMessage());
        }
      },
    };
  } catch (e) {
    console.error(e);

    const error = new FailedConnectionError(e);

    return {
      status: -1,
      error: error.message,
      headers: new Headers(),
      get data(): never {
        throw error;
      },
      checkError() {
        throw error;
      },
    };
  }
}

export default executeRequest;
