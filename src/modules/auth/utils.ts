import jwtDecode from 'jwt-decode';

export const STORAGE_TOKEN_KEY = 'auth_token';
export const STORAGE_REFRESH_TOKEN_KEY = 'refresh_token';
export const STORAGE_USER_NAME_KEY = 'user_name';

type AuthTokenPayload = {
  sub: string; // user account id
  email: string;
  roles: string[];
};

export const decodeAuthToken = (jwt: string): AuthTokenPayload => jwtDecode<AuthTokenPayload>(jwt);

export const STORAGE_ALREADY_BEEN_AUTH_KEY = 'already_been_auth';
