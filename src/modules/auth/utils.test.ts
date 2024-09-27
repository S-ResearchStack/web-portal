import jwtDecode from 'jwt-decode';
import { decodeAuthToken } from './utils';

jest.mock('jwt-decode', () => jest.fn());
describe('authUtils', () => {
  it('decodeAuthToken', () => {
    const expectedPayload = {
      sub: '123',
      email: 'email@email.com',
    };
    (jwtDecode as jest.Mock).mockReturnValue(expectedPayload);
    const jwt =
      'jjjjjjjjjjjjjjjjjjjwwwwwwwwwwwwwwwwwwwwwwwwwwwwttttttttttttttttttttttttttttttt';
    expect(decodeAuthToken(jwt)).toEqual(expectedPayload);
  });
  it('[NEGAVETIVE] decodeAuthToken with empty jwt', () => {
    (jwtDecode as jest.Mock).mockReturnValue(undefined);
    expect(decodeAuthToken('')).toBeUndefined();
  });
});
