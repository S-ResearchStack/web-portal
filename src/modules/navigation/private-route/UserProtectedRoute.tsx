import React from 'react';
import { RouteProps } from 'react-router-dom';

import {isUserRegistered} from 'src/modules/auth/auth.slice';
import PrivateRoute from "src/modules/navigation/private-route/PrivateRoute";

type Props = RouteProps;

const UserProtectedRoute: React.FC<Props> = ({  children, ...rest}) => {
  const registered = isUserRegistered();

  return (
    <PrivateRoute
      authenticated={registered}
      {...rest}>
      {children}
    </PrivateRoute>);
};

export default UserProtectedRoute;
