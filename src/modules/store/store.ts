/* eslint-disable import/no-import-module-exports */
import {
  Action,
  ThunkAction,
  configureStore,
  getDefaultMiddleware,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';

import { history } from 'src/modules/navigation/store';
import rootReducer from 'src/modules/store/reducers';
import { History } from 'history';

export { rootReducer };

export const makeStore = (h?: History) =>
  configureStore({
    reducer: rootReducer(),
    middleware: [...getDefaultMiddleware(), routerMiddleware(h ?? history)],
    devTools: process.env.NODE_ENV !== 'production',
  });

export const store = makeStore();

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('./reducers', async () => {
    // eslint-disable-next-line import/no-useless-path-segments
    const nextRootReducer = (await import('../store/reducers')).default;
    store.replaceReducer(nextRootReducer());
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
