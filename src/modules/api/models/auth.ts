import { UserProfile } from './study';

export type SigninRequest = {
  email: string;
  password: string;
};

export type SigninResponse = {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

export type SignUpRequest = {
  email: string;
  password: string;
};

export type RegisterUserRequest = {
  firstName: string;
  lastName: string;
  company: string;
  team: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;
}

export type GetUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  team: string;
  email: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;
  roles?: string[];
  name?: string;
}

export type VerifyEmailRequest = {
  token: string;
};

export type ResendVerificationEmailRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  password: string;
  resetToken: string;
  profile?: UserProfile;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type RefreshTokenBody = {
  jwt: string;
  refreshToken: string;
};

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
};

export type RefreshGoogleTokenBody = {
  refreshToken: string;
};

export type RefreshGoogleTokenResponse = {
  access_token: string;
  id_token: string;
  expires_in: number;
};
