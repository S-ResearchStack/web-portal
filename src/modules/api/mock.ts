import waitFor from 'src/common/utils/waitFor';

import * as endpoints from './endpoints';
import { Response } from './executeRequest';
import { SqlResponse } from './models/sql';

export type ApiEndpoints = typeof endpoints;

const MOCK_OPTIONS = ['disabled', 'only_non_implemented', 'always'] as const;
type MockOption = typeof MOCK_OPTIONS[number];

let MOCK: MockOption = 'only_non_implemented'; // TODO: change to 'disabled' by default when all APIs available
{
  const mockEnvValue = (localStorage.getItem('MOCK_API') || process.env.MOCK_API) as
    | MockOption
    | undefined;
  if (process.env.NODE_ENV === 'test') {
    MOCK = 'always';
  } else if (mockEnvValue) {
    if (MOCK_OPTIONS.includes(mockEnvValue)) {
      console.info(`Using mock option: ${mockEnvValue}`);
      MOCK = mockEnvValue;
    } else {
      console.warn(`Invalid MOCK_API value: ${mockEnvValue}`);
    }
  }
}

const MOCK_REQUEST_DURATION = 1500;

const implementedEndpoints: (keyof ApiEndpoints)[] = [
  'signin',
  'resetPassword',
  'getUsers',
  'inviteUser',
  'updateUserRole',
  'removeUserRole',
  'getStudies',
  'createStudy',
  'getParticipantsTotalItems',
  'getParticipants',
  'getParticipant',
  'getParticipantHeartRates',
  'getAverageParticipantHeartRate',
  'getAverageStepCount',
  'getTablesList',
  'getTableColumns',
  'executeDataQuery',
  'createTask',
  'getTasks',
  'getTask',
  'updateTask',
  'getTaskItemResults',
  'getTaskRespondedUsersCount',
  'getTaskCompletionTime',
];

export const mockedEndpoints: Partial<ApiEndpoints> = {};

export const provideEndpoints = (mock: Partial<ApiEndpoints>) => {
  Object.assign(mockedEndpoints, mock);
};

export const maskEndpointAsFailure = async <T>(
  endpoint: keyof ApiEndpoints,
  cb: () => Promise<T>,
  error?: Partial<typeof failedResponse extends (arg: infer U) => unknown ? U : never>
) => {
  const prevMock = mockedEndpoints[endpoint];

  provideEndpoints({
    [endpoint]() {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return failedResponse({
        status: 500,
        ...error,
      });
    },
  });

  const result = await cb();

  provideEndpoints({
    [endpoint]: prevMock,
  });

  return result;
};

export const createMockEndpointsProxy = <T extends ApiEndpoints>(target: T) =>
  new Proxy(target, {
    get(t, name) {
      const isEndpointMocked = name in mockedEndpoints;
      const isEndpointImplemented = implementedEndpoints.includes(name as keyof ApiEndpoints);

      if (
        isEndpointMocked &&
        (MOCK === 'always' || (MOCK === 'only_non_implemented' && !isEndpointImplemented))
      ) {
        return mockedEndpoints[name as keyof typeof mockedEndpoints];
      }
      return t[name as keyof T];
    },
  });

const waitIfNeeded = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await waitFor(MOCK_REQUEST_DURATION);
  }
};

export const response = async <T = void>(body: T): Promise<Response<T>> => {
  await waitIfNeeded();

  return {
    status: body ? 200 : 204,
    error: undefined,
    headers: new Headers(),
    get data() {
      return body;
    },
    checkError: () => {},
  };
};

export const sqlResponse = <R extends Record<K, string>, K extends string>(
  rows: R[]
): Promise<Response<SqlResponse<R>>> => {
  const columns = Object.keys(rows[0]) as K[];

  return response({
    metadata: {
      columns,
      count: columns.length,
    },
    data: rows,
  });
};

export const failedResponse = async ({
  status,
  message,
}: {
  status: number;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<Response<any>> => {
  await waitIfNeeded();

  const errorMessage = message || `Status code ${status}`;

  return {
    status,
    error: errorMessage,
    headers: new Headers(),
    get data(): never {
      throw new Error(errorMessage);
    },
    checkError() {
      throw new Error(errorMessage);
    },
  };
};
