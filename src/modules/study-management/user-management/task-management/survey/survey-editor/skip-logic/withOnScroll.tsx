import React, { useLayoutEffect, useRef } from 'react';
import useScroll from 'react-use/lib/useScroll';

import _isEqual from 'lodash/isEqual';

const withOnScroll = <P extends React.PropsWithRef<object>>(Component: React.ComponentType<P>) => {
  const InnerComponent = (props: P & { onScroll?: (scroll: { x: number; y: number }) => void }) => {
    const { onScroll, ...restProps } = props;
    const ref = useRef(null);
    const scroll = useScroll(ref);
    const prevScrollRef = useRef<typeof scroll>();

    useLayoutEffect(() => {
      if (!_isEqual(scroll, prevScrollRef.current)) {
        prevScrollRef.current = scroll;
        onScroll?.(scroll);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scroll]);

    return <Component {...(restProps as P)} ref={ref} />;
  };

  return InnerComponent;
};

export default withOnScroll;
