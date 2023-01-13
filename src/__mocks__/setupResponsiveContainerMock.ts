import React from 'react';

jest.mock('react-resize-detector', () => ({
  useResizeDetector: () => ({
    width: 100,
    height: 100,
    ref: React.createRef(),
  }),
}));
