import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { isAuthorizedSelector } from 'src/modules/auth/auth.slice';
import { Path } from '../store';

type Props = RouteProps;

const PrivateRoute: React.FC<Props> = ({ children, ...rest }) => {
  const authorized = useSelector(isAuthorizedSelector);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        authorized ? (
          (children as React.ReactNode)
        ) : (
          <Redirect
            to={{
              pathname: Path.SignIn,
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
