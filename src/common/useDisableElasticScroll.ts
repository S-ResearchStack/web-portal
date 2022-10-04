import React from 'react';
import useEvent from 'react-use/lib/useEvent';
import browser from 'src/common/utils/browser';

const useDisableElasticScroll = (ref: React.RefObject<HTMLElement>) => {
  // for FF and other with support 'overscroll-behavior'
  if (ref.current) {
    ref.current.style.overscrollBehavior = 'none';
  }

  // for Safari
  useEvent(
    'scroll',
    (evt) => {
      if (browser.isSafari) {
        const target = evt.target as HTMLElement;

        const minScrollTop = 0;
        const maxScrollTop = target.scrollHeight - target.offsetHeight;

        if (target.scrollTop < minScrollTop) {
          evt.stopPropagation();
          target.scrollTop = 0;
        }

        if (target.scrollTop > maxScrollTop) {
          evt.stopPropagation();
          target.scrollTop = maxScrollTop;
        }
      }
    },
    ref.current
  );
};

export default useDisableElasticScroll;
