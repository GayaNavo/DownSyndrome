// Mock Firebase modules
jest.mock('@/lib/firebase/config', () => ({
  getAuthInstance: jest.fn(() => ({
    currentUser: null,
  })),
  getFirestoreInstance: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
      })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
      get: jest.fn(),
    })),
  })),
}));

jest.mock('@/lib/firebase/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  logOut: jest.fn(),
  resetPassword: jest.fn(),
  signInWithGoogle: jest.fn(),
  handleGoogleRedirectResult: jest.fn(),
}));
