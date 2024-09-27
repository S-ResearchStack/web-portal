import jwtDecode from 'jwt-decode';

export const STORAGE_JWT_TYPE = 'jwt_issuer';
export const STORAGE_TOKEN_KEY = 'auth_token';
export const STORAGE_REFRESH_TOKEN_KEY = 'refresh_token';
export const STORAGE_ALREADY_BEEN_AUTH_KEY = 'already_been_auth';
export const STORAGE_USER_KEY = 'user';
export const STORAGE_ALREADY_BEEN_USER_KEY = 'already_been_user'
export const STORAGE_SHOW_STUDIES = 'show_studies'
export const STORAGE_REMEMBER_USER = 'remember_user'

type AuthTokenPayload = {
  sub: string; // user account id
  email: string;
};

export const decodeAuthToken = (jwt: string): AuthTokenPayload => jwtDecode<AuthTokenPayload>(jwt);


