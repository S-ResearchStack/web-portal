import React from 'react';
import styled from 'styled-components';
import { useResizeDetector } from 'react-resize-detector';

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

type Props = {
  className?: string;
  provideHeight?: boolean;
  children:
    | React.ReactElement<{ width: number; height?: number }>
    | ((p: { width: number; height?: number }) => React.ReactElement);
};

const ResponsiveContainer = ({ className, provideHeight, children }: Props) => {
  const { width, height, ref } = useResizeDetector();

  let childrenWithSize: React.ReactNode = null;
  if ((!provideHeight && width) || (provideHeight && width && height)) {
    childrenWithSize =
      typeof children === 'function'
        ? children({ width, height })
        : React.cloneElement(children, provideHeight ? { width, height } : { width });
  }

  return (
    <Container className={className} ref={ref}>
      {childrenWithSize}
    </Container>
  );
};

export default ResponsiveContainer;
