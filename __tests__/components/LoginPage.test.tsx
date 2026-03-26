import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/components/LoginPage';
import { createMockRouter } from '../__mocks__/nextRouterMock';
import { useAuth } from '@/contexts/AuthContext';

// Mock the auth context
jest.mock('@/contexts/AuthContext');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => createMockRouter(),
}));

describe('LoginPage', () => {
  const mockSignIn = jest.fn();
  const mockSignInWithGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      currentUser: null,
      loading: false,
      logout: jest.fn(),
      resetPassword: jest.fn(),
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
      
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
  });

  it('displays validation error for empty fields', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(submitButton);
    
    // Form should prevent submission or show validation
    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it('calls signIn with correct credentials on form submit', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message when sign in fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles Google sign in button click', async () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByRole('button', { name: /google/i });
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('displays loading state during sign in', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled or show loading state
    expect(submitButton).toBeDisabled();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    // Find the toggle button next to the password input
    const passwordField = passwordInput.closest('div.relative');
    const toggleButton = passwordField?.querySelector('button[type="button"]') as HTMLButtonElement;
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton);
    
    expect(passwordInput.type).toBe('text');
  });
});
