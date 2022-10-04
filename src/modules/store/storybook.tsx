import React from 'react';
import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { DecoratorFunction } from '@storybook/csf';
import { ReactFramework } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { rootReducer, RootState } from './store';

export const getStoreDecorator = (state: ConfigureStoreOptions<RootState>['preloadedState']) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: state,
  });

  return ((story) => (
    <Provider store={store}>
      <MemoryRouter>{story()}</MemoryRouter>
    </Provider>
  )) as DecoratorFunction<ReactFramework>;
};
