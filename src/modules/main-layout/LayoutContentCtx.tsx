import React, { useContext } from 'react';

export const LayoutContentCtx = React.createContext<React.RefObject<HTMLDivElement>>({
  current: document.createElement('div'),
});

export const useLayoutContentRef = (): React.RefObject<HTMLDivElement> =>
  useContext(LayoutContentCtx);
