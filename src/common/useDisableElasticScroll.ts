import React from 'react';
import browser from 'src/common/utils/browser';

const useDisableElasticScroll = (ref: React.RefObject<HTMLElement>) => {
  if (ref.current) {
    if (browser.isFirefox) {
      ref.current.style.overscrollBehavior = 'none';
    }

    if (browser.isSafari) {
      ref.current.style.webkitOverflowScrolling = 'touch';
    }
  }
};

export default useDisableElasticScroll;
