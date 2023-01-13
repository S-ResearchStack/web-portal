import executeRequest from 'src/modules/api/executeRequest';

const responseData = {
  test: 'test',
};

beforeAll(() => {
  global.fetch = jest.fn((url: string) => {
    if (url.includes('connection-error')) {
      return Promise.reject(new Error('Failed to connect'));
    }

    return Promise.resolve({
      ...(url.includes('error')
        ? {
            ok: false,
            status: 500,
          }
        : {
            ok: true,
            status: 200,
          }),
      headers: {},
      blob: () => Promise.resolve(url.includes('bad-data') ? null : responseData),
      json: () => Promise.resolve(url.includes('bad-data') ? null : responseData),
    });
  }) as unknown as typeof fetch;
});

describe('executeRequest', () => {
  it('Should execute successfully request', async () => {
    const { data } = await executeRequest({
      url: 'https://samsung.com/test',
      query: responseData,
    });

    expect(data).toEqual(responseData);
  });

  it('[NEGATIVE] Should execute failure request', async () => {
    expect.assertions(1);

    try {
      const response = await executeRequest({
        url: 'https://samsung.com/error',
      });

      response.data;
    } catch (e) {
      expect(String(e)).toMatch('500');
    }
  });

  it('[NEGATIVE] Should execute failure request with manual check error', async () => {
    expect.assertions(1);

    try {
      const response = await executeRequest({
        url: 'https://samsung.com/error',
      });

      response.checkError();
    } catch (e) {
      expect(String(e)).toMatch('500');
    }
  });

  it('[NEGATIVE] Should execute successfully request with broken response data', async () => {
    const { data } = await executeRequest({
      url: 'https://samsung.com/bad-data',
      query: responseData,
    });

    expect(data).toBeNull();
  });

  it('[NEGATIVE] should execute failure when failed to connect', async () => {
    expect.assertions(2);

    const response = await executeRequest({
      url: 'https://samsung.com/connection-error',
    });
    expect(response.status).toBe(-1);
    expect(String(response.error)).toMatch('Server connection failed');

    try {
      expect(response.data).toBeDefined();
    } catch {
      // ignore
    }
  });
});
