declare module '@transcend-io/conflux';
declare module 'native-file-system-adapter';

interface ShowSaveFilePickerOptions {
  suggestedName: string;
}

interface Window {
  showSaveFilePicker: (options?: ShowSaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
}

interface CSSStyleDeclaration {
  webkitOverflowScrolling: string;
}

declare module '*.svg?url' {
  const src: string;
  export default src;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test' | 'none';
    API_URL: string | undefined;
    PUBLIC_PATH: string | undefined;
    MOCK_API: string;
    VERSION: string;
  }
}

declare module 'smoothscroll-polyfill' {
  class Polyfill {
    static polyfill(): void;
  }
  export default Polyfill;
}

declare module 'css-spring';
