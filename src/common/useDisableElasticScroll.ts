import React from 'react';

const useDisableElasticScroll = (ref: React.RefObject<HTMLElement>) => {
  if (ref.current) {
    ref.current.style.overscrollBehavior = 'none'; // FF
    ref.current.style.webkitOverflowScrolling = 'touch'; // Safari iOS
  }
};

export default useDisableElasticScroll;
