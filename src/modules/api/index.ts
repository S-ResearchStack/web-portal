import * as endpoints from './endpoints';
import { setAuthProvider } from './apiService';
import * as mock from './mock';

export * from './models';

export default mock.createMockEndpointsProxy({
  ...endpoints,
  setAuthProvider,
  mock,
});
