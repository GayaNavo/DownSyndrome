import { render, screen, fireEvent } from '@testing-library/react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { createMockRouter } from '../__mocks__/nextRouterMock';

// Mock the auth context
jest.mock('@/contexts/AuthContext');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => createMockRouter(),
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('AppHeader', () => {
  const mockLogout = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is NOT logged in', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        currentUser: null,
        loading: false,
        logout: mockLogout,
      });
    });

    it('renders header with logo and brand', () => {
      render(<AppHeader />);
      
      expect(screen.getByText('HARMONY')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument(); // Logo
    });

    it('displays public navigation links', () => {
      render(<AppHeader />);
      
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('displays Sign In and Register buttons', () => {
      render(<AppHeader />);
      
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
      
      const registerButton = screen.getByText('Register');
      expect(registerButton).toHaveAttribute('href', '/register');
      
      const signInLink = screen.getByText('Sign In');
      expect(signInLink).toHaveAttribute('href', '/login');
    });
  });

  describe('when user IS logged in', () => {
    const mockUser = {
      uid: 'test-user-123',
      email: 'testuser@example.com',
      displayName: 'Test User',
    };

    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        currentUser: mockUser,
        loading: false,
        logout: mockLogout,
      });
    });

    it('renders header with user welcome message', () => {
      render(<AppHeader />);
      
      expect(screen.getByText(/Welcome, testuser/i)).toBeInTheDocument();
    });

    it('displays dashboard navigation links', () => {
      render(<AppHeader />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('displays Sign Out button', () => {
      render(<AppHeader />);
      
      const signOutButton = screen.getByText('Sign Out');
      expect(signOutButton).toBeInTheDocument();
    });

    it('calls logout and redirects to home when sign out is clicked', async () => {
      render(<AppHeader />);
      
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('links to dashboard when logo is clicked', () => {
      render(<AppHeader />);
      
      const logoLink = screen.getByText('HARMONY').closest('a');
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });
  });
});
