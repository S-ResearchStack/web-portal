import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { Path } from '../store';

interface Props {
  authenticated: boolean
}

const PrivateRoute: React.FC<Props & RouteProps> = ({authenticated, children, ...rest }) => (
    <Route
      {...rest}
      render={({ location }) =>
        authenticated ? (
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

export default PrivateRoute;
