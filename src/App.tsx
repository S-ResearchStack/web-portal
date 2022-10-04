import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

import { store } from 'src/modules/store/store';
import { history, Path } from 'src/modules/navigation/store';
import PrivateRoute from 'src/modules/navigation/private-route/PrivateRoute';
import MainLayout from 'src/modules/main-layout/MainLayout';
import SignInScreen from 'src/modules/auth/signin/SignInScreen';
import AccountActivationScreen from 'src/modules/auth/signin/AccountActivationScreen';
import CreateStudyScreen from 'src/modules/auth/signin/CreateStudyScreen';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import { theme, GlobalStyles } from 'src/styles';

import 'src/modules/auth/authProvider';

const App = () => (
  <ThemeProvider theme={theme}>
    <TooltipProvider>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Provider store={store}>
          <GlobalStyles />
          <ConnectedRouter history={history}>
            <Switch>
              <Route path={Path.SignIn} component={SignInScreen} />
              <Route path={Path.AccountActivation} component={AccountActivationScreen} />
              <PrivateRoute path={Path.CreateStudy}>
                <CreateStudyScreen />
              </PrivateRoute>
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            </Switch>
          </ConnectedRouter>
        </Provider>
        <TooltipsList />
      </DndProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
