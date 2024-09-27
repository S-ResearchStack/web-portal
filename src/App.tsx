import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

import { ThemeProvider } from 'styled-components';

import { store } from 'src/modules/store/store';
import { history, Path } from 'src/modules/navigation/store';
import UserProtectedRoute from 'src/modules/navigation/private-route/UserProtectedRoute';
import MainLayout from 'src/modules/main-layout/MainLayout';
import SignIn from 'src/modules/auth/signin/SignIn';
import SignUp from 'src/modules/auth/signup/SignUp';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import { theme, GlobalStyles } from 'src/styles';

import 'src/modules/auth/authProvider';
import { ModalProvider } from 'src/common/components/Modal';
import buildProvidersTree from './common/components/ProviderTree/ProviderTree';
import RegistrationScreen from 'src/modules/auth/registration/RegistrationScreen';
import TokenProtectedRoute from 'src/modules/navigation/private-route/TokenProtectedRoute';
import CreateStudyScreen from 'src/modules/studies/CreateStudyScreen';


const ProvidersTree = buildProvidersTree([
  [ThemeProvider, { theme: theme }],
  [TooltipProvider, {}],
  [ModalProvider, {}],
  [DndProvider, { backend: TouchBackend, options: { enableMouseEvents: true } }],
  [Provider, { store }]
]);

const App = () => (
  <ProvidersTree>
    <GlobalStyles />
    <ConnectedRouter history={history}>
      <Switch>
        <Route path={Path.SignIn} component={SignIn} />
        <Route path={Path.AccountCreate} component={SignUp} />
        <TokenProtectedRoute path={Path.Registration}>
          <RegistrationScreen />
        </TokenProtectedRoute>
        <UserProtectedRoute path={Path.CreateStudy}>
            <CreateStudyScreen />
        </UserProtectedRoute>
        <UserProtectedRoute>
          <MainLayout />
        </UserProtectedRoute>
      </Switch>
    </ConnectedRouter>
    <TooltipsList />
  </ProvidersTree>
);

export default App;
