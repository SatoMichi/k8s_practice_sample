const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // next.config.jsと.envファイルを読み込むために、Next.jsアプリケーションのパスを指定
  dir: './',
});

// Jestに渡すカスタム設定
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfigは、非同期のNext.jsの設定を読み込むために使用
module.exports = createJestConfig(customJestConfig); 
