import { response, sqlResponse, failedResponse } from './mock';

describe('mock.ts', () => {
  describe('response', () => {
    it('should return a successful response with a body', async () => {
      const body = { key: 'value' };
      const result = await response(body);
      expect(result.status).toBe(200);
      expect(result.data).toEqual(body);
    });

    it('[NEGATIVE] should return a successful response without a body', async () => {
      const body = undefined;
      const result = await response(body);
      expect(result.status).toBe(204);
      expect(result.data).toBeUndefined();
    });
  });

  describe('sqlResponse', () => {
    it('should return a successful SQL response with metadata and data', async () => {
      const rows = [{ id: '1', name: 'John Doe' }];
      const result = await sqlResponse(rows);
      expect(result.status).toBe(200);
      expect(result.data.metadata.columns).toEqual(['id', 'name']);
      expect(result.data.metadata.count).toBe(2);
      expect(result.data.data).toEqual(rows);
    });
  });

  describe('failedResponse', () => {
    it('should return a failed response with a custom status and message', async () => {
      const status = 404;
      const message = 'Resource not found';
      const result = await failedResponse({ status, message });
      expect(result.status).toBe(status);
      expect(result.error).toBe(message);
    });

    it('[NEGATIVE] should return a failed response with a default message', async () => {
      const status = 500;
      const result = await failedResponse({ status });
      expect(result.status).toBe(status);
      expect(result.error).toMatch(/Status code 500/);
    });
  });
});
