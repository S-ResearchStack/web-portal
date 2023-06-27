module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    'node_modules/(react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend)/.+\\.(j|t)sx?$':
      'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd|antlr4)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/src/__mocks__/svg.ts',
    '^src(.*)$': '<rootDir>/src$1',
    d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    antlr4: '<rootDir>/node_modules/antlr4/dist/antlr4.web.js',
  },
  resetMocks: false,
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: [
    'jest-extended/all',
    '<rootDir>/src/__mocks__/setupCreateObjectUrlMock.ts',
    '<rootDir>/src/__mocks__/setUpDateMock.ts',
    '<rootDir>/src/__mocks__/setupGetComputedTextLengthMock.ts',
    '<rootDir>/src/__mocks__/setupRangeMock.ts',
    '<rootDir>/src/__mocks__/setupResizeObserverMock.ts',
    '<rootDir>/src/__mocks__/setupResponsiveContainerMock.ts',
    '<rootDir>/src/__mocks__/setupScrollIntoViewMock.ts',
    '<rootDir>/src/__mocks__/setUpTextDecoderMock.ts',
    '<rootDir>/src/__mocks__/setupUniqueIdMock.ts',
    '<rootDir>/src/__mocks__/setupWindowMatchMediaMock.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    // generated files from antlr
    '!src/modules/study-management/user-management/task-management/survey/survey-editor/antlr/*.ts',
  ],
  testTimeout: 120000,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-reports', outputName: 'report.xml' }],
  ],
};
