import { ERROR_BASE_URL, request, supersetRequest, setAuthProvider } from 'src/modules/api/apiService';

const responseData = {
  test: 'test',
};

const getPartOfResponseByUrl = (url: string) => {
  if (url.includes('auth-error')) {
    return {
      ok: false,
      status: 401,
    };
  }

  if (url.includes('error')) {
    return {
      ok: false,
      status: 500,
    };
  }

  return {
    ok: true,
    status: 200,
  };
};

const fetchFn = jest.fn((url: string) =>
  Promise.resolve({
    ...getPartOfResponseByUrl(url),
    headers: {},
    blob: () => Promise.resolve(),
    json: () => Promise.resolve(url.includes('broken-data') ? null : responseData),
  })
);

beforeAll(() => {
  global.fetch = fetchFn as unknown as typeof fetch;
});

describe('request', () => {
  beforeEach(() => {
    localStorage.setItem('API_URL', 'https://samsung.com/');
  });

  it('should execute request', async () => {
    const { data } = await request({
      body: responseData,
      headers: {},
      method: 'GET',
      path: '/test',
      query: responseData,
    });

    expect(data).toEqual(responseData);
  });

  it('[NEGATIVE] should execute failure request', async () => {
    expect.assertions(2);
    try {
      const response = await request({
        body: responseData,
        headers: {},
        method: 'GET',
        path: '/error',
        query: responseData,
      });

      try {
        response.data;
      } catch (e) {
        expect(String(e)).toMatch('500');
      }

      try {
        response.checkError();
      } catch (e) {
        expect(String(e)).toMatch('500');
      }
    } catch {
      // do nothing
    }
  });

  const jwtType = 'super-tokens';
  const token = 'test-auth-token';

  const provider = {
    getTokenType: jest.fn(() => jwtType),
    getBearerToken: jest.fn(() => token),
    onUnauthorizedError: jest.fn(),
    refreshBearerToken: jest.fn(),
  };

  it('should execute request with auth provider', async () => {
    fetchFn.mockClear();

    setAuthProvider(provider);

    await request({
      body: responseData,
      method: 'GET',
      path: 'test',
      query: responseData,
    });

    expect(fetchFn.mock.calls[0]).toMatchObject([
      'https://samsung.com/test?test=test',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(responseData),
      },
    ]);
  });

  it('[NEGATIVE] should execute unauthorized request', async () => {
    provider.onUnauthorizedError.mockClear();

    setAuthProvider(provider);

    await request({
      body: responseData,
      method: 'GET',
      path: 'auth-error',
      query: responseData,
    });

    expect(provider.onUnauthorizedError).toHaveBeenCalledTimes(1);
  });

  it('[NEGATIVE] should execute failure request without `API_URL`', async () => {
    expect.assertions(3);
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const ORIG_ENV = process.env

    try {
      localStorage.removeItem('API_URL');
      process.env = { ...ORIG_ENV, API_URL: '' };

      const response = await request({
        body: responseData,
        headers: {},
        method: 'GET',
        path: '/test',
        query: responseData,
      });

      try {
        response.data;
      } catch (e) {
        expect(String(e)).toMatch(ERROR_BASE_URL);
      }

      try {
        response.checkError();
      } catch (e) {
        expect(String(e)).toMatch(ERROR_BASE_URL);
      }
    } catch (e) {
      // do nothing
    } finally {
      expect(console.error).toHaveBeenCalledWith(new Error(ERROR_BASE_URL));
    }

    process.env = { ...ORIG_ENV };
    spy.mockRestore();
  });

  it('[NEGATIVE] should execute request with broken response data', async () => {
    const response = await request({
      body: responseData,
      headers: {},
      method: 'GET',
      path: '/broken-data',
      query: responseData,
    });

    expect(response.data).toBeNull();
  });
});

describe('supersetRequest', () => {
  beforeEach(() => {
    localStorage.setItem('SUPERSET_URL', 'https://samsung.com/');
  });

  it('should execute request', async () => {
    const { data } = await supersetRequest({
      body: responseData,
      headers: {},
      method: 'GET',
      path: '/test',
      query: responseData,
    });

    expect(data).toEqual(responseData);
  });

  it('[NEGATIVE] should execute failure request', async () => {
    expect.assertions(2);
    try {
      const response = await supersetRequest({
        body: responseData,
        headers: {},
        method: 'GET',
        path: '/error',
        query: responseData,
      });

      try {
        response.data;
      } catch (e) {
        expect(String(e)).toMatch('500');
      }

      try {
        response.checkError();
      } catch (e) {
        expect(String(e)).toMatch('500');
      }
    } catch {
      // do nothing
    }
  });

  it('[NEGATIVE] should execute failure request without `SUPERSET_URL`', async () => {
    expect.assertions(3);
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const ORIG_ENV = process.env

    try {
      localStorage.removeItem('SUPERSET_URL');
      process.env = { ...ORIG_ENV, SUPERSET_URL: '' };

      const response = await supersetRequest({
        body: responseData,
        headers: {},
        method: 'GET',
        path: '/test',
        query: responseData,
      });

      try {
        response.data;
      } catch (e) {
        expect(String(e)).toMatch(ERROR_BASE_URL);
      }

      try {
        response.checkError();
      } catch (e) {
        expect(String(e)).toMatch(ERROR_BASE_URL);
      }
    } catch (e) {
      // do nothing
    } finally {
      expect(console.error).toHaveBeenCalledWith(new Error(ERROR_BASE_URL));
    }

    process.env = { ...ORIG_ENV };
    spy.mockRestore();
  });

  it('[NEGATIVE] should execute request with broken response data', async () => {
    const response = await supersetRequest({
      body: responseData,
      headers: {},
      method: 'GET',
      path: '/broken-data',
      query: responseData,
    });

    expect(response.data).toBeNull();
  });
});
