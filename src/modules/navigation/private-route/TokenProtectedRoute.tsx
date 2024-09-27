import React from 'react';
import { useSelector } from 'react-redux';
import { RouteProps } from 'react-router-dom';

import { isTokenExistSelector } from 'src/modules/auth/auth.slice';
import PrivateRoute from "src/modules/navigation/private-route/PrivateRoute";

type Props = RouteProps;

const TokenProtectedRoute: React.FC<Props> = ({ children, ...rest }) => {
  const authenticated = useSelector(isTokenExistSelector);

  return (
    <PrivateRoute
      authenticated={authenticated}
      {...rest}>
      {children}
    </PrivateRoute>);
};

export default TokenProtectedRoute;
