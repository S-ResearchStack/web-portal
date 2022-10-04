declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
}

declare module '*.svg?url' {
  const src: string;
  export default src;
}

declare module 'connected-react-router' {
  interface ConnectedRouterProps {
    children: React.ReactNode;
  }
}

declare const env: {
  NODE_ENV: 'production' | 'development' | 'none';
  API_URL: string | undefined;
  PUBLIC_PATH: string | undefined;
  MOCK_API: string;
  VERSION: string;
};

declare module 'smoothscroll-polyfill' {
  class Polyfill {
    static polyfill(): void;
  }
  export default Polyfill;
}

declare module 'css-spring';
