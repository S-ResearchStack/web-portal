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
import SignUp from 'src/modules/auth/signup/SignUp';
import CheckMailbox from 'src/modules/auth/signup/CheckMailbox';
import AccountCreated from 'src/modules/auth/signup/AccountCreated';
import CreateStudyScreen from 'src/modules/studies/CreateStudyScreen';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import { theme, GlobalStyles } from 'src/styles';

import 'src/modules/auth/authProvider';
import ForgotPassword from 'src/modules/auth/forgot-password/ForgotPassword';
import ForgotPasswordCheckMailbox from 'src/modules/auth/forgot-password/ForgotPasswordCheckMailbox';
import ResetPassword from 'src/modules/auth/forgot-password/ResetPassword';
import PasswordChanged from 'src/modules/auth/forgot-password/PasswordChanged';

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
              <Route path={Path.AccountCreate} component={SignUp} />
              <Route path={Path.AccountConfirm} component={CheckMailbox} />
              <Route path={Path.AccountVerification} component={AccountCreated} />
              <Route exact path={Path.ForgotPassword} component={ForgotPassword} />
              <Route
                exact
                path={Path.ForgotPasswordConfirm}
                component={ForgotPasswordCheckMailbox}
              />
              <Route exact path={Path.ResetPassword} component={ResetPassword} />
              <Route exact path={Path.ResetPasswordComplete} component={PasswordChanged} />
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
