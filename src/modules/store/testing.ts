import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { rootReducer, RootState } from './store';

export const createTestStore = (
  state: ConfigureStoreOptions<RootState>['preloadedState'],
  h?: History
) =>
  configureStore({
    reducer: rootReducer(),
    preloadedState: state,
    middleware: h
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (((getDefaultMiddleware: any) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getDefaultMiddleware().concat(routerMiddleware(h))) as any)
      : undefined,
  });
