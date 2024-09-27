import API from 'src/modules/api';
import type { SigninResponse } from 'src/modules/api';

const isValidEmail = (v: string) => v.includes('samsung');
const isDuplicateEmail = (v: string) => v.includes('duplicate');
const signinSuccessMock = ({ email }: { email: string }) => {
  const header = window.btoa(JSON.stringify({}));
  const payload = window.btoa(JSON.stringify({ email }));
  const accessToken = `${header}.${payload}`;
  const refreshToken = `refresh.${accessToken}`;
  return API.mock.response<SigninResponse>({
    id: email,
    email,
    accessToken,
    refreshToken,
  });
};

API.mock.provideEndpoints({
  signin({ email }) {
    if (isValidEmail(email)) {
      return signinSuccessMock({ email });
    };

    return API.mock.failedResponse({ status: 401 });
  },
  signup(body) {
    if (isDuplicateEmail(body.email)) {
      return API.mock.failedResponse({ status: 409 });
    };

    if (isValidEmail(body.email)) {
      return API.mock.response(undefined);
    };

    return API.mock.failedResponse({ status: 501 });
  },
  getGoogleToken() {
    return API.mock.response({
      expires_in: 3599,
      id_token: "id_token",
      access_token: "access_token",
      refresh_token: "refresh_token",
    })
  },
  refreshGoogleToken() {
    return API.mock.response({
      expires_in: 3599,
      id_token: "id_token",
      access_token: "access_token",
    });
  },
  registerUser() {
    return API.mock.response(undefined);
  },
  getUser() {
    return API.mock.response({
      id: "user-id",
      firstName: "firstName",
      lastName: "lastName",
      company: "company",
      team: "team",
      email: "email@email.com",
      officePhoneNumber: "001",
      mobilePhoneNumber: "002",
      roles: ['testStudy_studyManager']
    })
  },
});
