import React, { useContext } from 'react';

export const PreviewScreenCtx = React.createContext<React.RefObject<HTMLDivElement>>({
  current: document.createElement('div'),
});

export const usePreviewScreenRef = (): React.RefObject<HTMLDivElement> =>
  useContext(PreviewScreenCtx);
