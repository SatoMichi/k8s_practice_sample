// jest-domのカスタムマッチャーを追加
import '@testing-library/jest-dom';

// グローバルなモックの設定
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// fetchのモック
global.fetch = jest.fn();

// console.errorのモック（Reactの警告を抑制）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18./.test(args[0]) ||
      /Warning: useLayoutEffect does nothing on the server/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 
