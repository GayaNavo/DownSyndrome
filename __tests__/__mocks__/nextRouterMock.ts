import { NextRouter } from 'next/router';

export const createMockRouter = (overrides?: Partial<NextRouter>): NextRouter => {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    params: {},
    query: {},
    isReady: true,
    isPreview: false,
    isLocaleDomain: false,
    isLoading: false,
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    ...overrides,
  } as NextRouter;
};

export default createMockRouter;
