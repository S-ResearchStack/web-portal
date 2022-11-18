import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { rootReducer, RootState } from './store';

export const createTestStore = (state: ConfigureStoreOptions<RootState>['preloadedState']) =>
  configureStore({
    reducer: rootReducer(),
    preloadedState: state,
  });
