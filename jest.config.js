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
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/src/__mocks__/svg.ts',
    '^src(.*)$': '<rootDir>/src$1',
    d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  resetMocks: false,
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.{ts,tsx}'],
  testTimeout: 60000,
};
