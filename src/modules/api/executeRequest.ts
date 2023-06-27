import qs from 'qs';

type MethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestOptions<TReq> = {
  url: string;
  method?: MethodType;
  query?: Record<string, unknown>;
  body?: TReq;
  headers?: Record<string, string>;
  readResponseAsStream?: boolean;
  readResponseAsBlob?: boolean;
  readResponseAsText?: boolean;
  mode?: RequestMode;
  keepalive?: boolean;
};

export type Response<TRes> = {
  status: number;
  headers: Headers;
  error?: string;
  data: TRes;
  checkError: () => void;
};

export const FAILED_CONNECTION_ERROR_TEXT = 'Server connection failed. Please try again later.';
export const GENERIC_SERVER_ERROR_TEXT = 'An unexpected error has occurred. Please try again.';

export class FailedConnectionError extends Error {
  constructor(public originalError?: unknown) {
    super(FAILED_CONNECTION_ERROR_TEXT);
  }
}

async function executeRequest<TReq, TRes>(opts: RequestOptions<TReq>): Promise<Response<TRes>> {
  const {
    method = 'GET',
    headers = {},
    query,
    mode,
    readResponseAsStream,
    readResponseAsBlob,
    readResponseAsText,
    keepalive,
  } = opts;
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
    const res = await fetch(url, { mode, method, headers, body, keepalive });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resBody: any;
    try {
      if (readResponseAsStream) {
        resBody = res.body;
      } else if (readResponseAsBlob) {
        resBody = await res.blob();
      } else if (readResponseAsText) {
        resBody = await res.text();
      } else {
        resBody = await res.json();
      }
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
