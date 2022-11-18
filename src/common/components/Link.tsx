import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

const LinkStyled = styled(RouterLink)`
  text-decoration: none;
  cursor: default;
  -webkit-user-drag: none;
  &:hover {
    cursor: pointer;
  }
`;

const Link: RouterLink = forwardRef((props, ref) => (
  <LinkStyled ref={ref} onDragStart={(evt) => evt.preventDefault()} {...props} />
));

export default Link;
