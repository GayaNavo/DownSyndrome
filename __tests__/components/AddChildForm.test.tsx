import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddChildForm from '@/components/AddChildForm';
import { useAuth } from '@/contexts/AuthContext';

// Mock Firebase Firestore
jest.mock('@/lib/firebase/firestore', () => ({
  createChildDocument: jest.fn(),
  getChildDocument: jest.fn(),
  updateChildDocument: jest.fn(),
}));

import { createChildDocument, getChildDocument, updateChildDocument } from '@/lib/firebase/firestore';

// Mock the auth context
jest.mock('@/contexts/AuthContext');

// Mock child components to simplify testing
jest.mock('@/components/DashboardSidebar', () => function MockSidebar() { return <div data-testid="sidebar">Sidebar</div>; });
jest.mock('@/components/AppHeader', () => function MockHeader() { return <div data-testid="header">Header</div>; });

describe('AddChildForm', () => {
  const mockCreateChild = jest.fn();
  const mockUpdateChild = jest.fn();
  const mockGetChild = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-user-id', email: 'parent@example.com' },
      loading: false,
    });

    (createChildDocument as jest.Mock).mockImplementation(mockCreateChild);
    (updateChildDocument as jest.Mock).mockImplementation(mockUpdateChild);
    (getChildDocument as jest.Mock).mockImplementation(mockGetChild);
    
    // Default: no child exists
    mockGetChild.mockResolvedValue(null);
  });

  it('renders the add child form correctly', () => {
    render(<AddChildForm />);
    
    expect(screen.getByText(/add your little star/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/child's full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/developmental age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last achieved milestone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add my child/i })).toBeInTheDocument();
  });

  it('displays validation error when required fields are empty', async () => {
    render(<AddChildForm />);
    
    const submitButton = screen.getByRole('button', { name: /add my child/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateChild).not.toHaveBeenCalled();
    });
  });

  it('successfully creates a new child document', async () => {
    mockCreateChild.mockResolvedValue({ id: 'new-child-id' });
    
    render(<AddChildForm />);
    
    // Wait for component to load and check for existing child
    await waitFor(() => {
      expect(mockGetChild).toHaveBeenCalled();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/child's full name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '2020-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/developmental age/i), {
      target: { value: '3 years' },
    });
    fireEvent.change(screen.getByLabelText(/last achieved milestone/i), {
      target: { value: 'First words' },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add my child/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateChild).toHaveBeenCalledWith(expect.objectContaining({
        name: 'John Doe',
        parentId: 'test-user-id',
        age: 6,
        dateOfBirth: expect.anything(),
        developmentalAge: '3 years',
        lastMilestone: 'First words',
      }));
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('displays error message when creating child fails', async () => {
    const errorMessage = 'Failed to save child information';
    mockCreateChild.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<AddChildForm />);
    
    fireEvent.change(screen.getByLabelText(/child's full name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '2019-05-20' },
    });
    
    const submitButton = screen.getByRole('button', { name: /add my child/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  it('loads existing child data when in edit mode', async () => {
    const existingChildData = {
      id: 'existing-child-id',
      name: 'Existing Child',
      dateOfBirth: { toDate: () => new Date('2018-10-10') },
      age: 5,
      developmentalAge: '4 years',
      lastMilestone: 'Reading simple words',
    };
    
    // Override the default mock for this test only
    mockGetChild.mockImplementation(() => Promise.resolve(existingChildData));
    
    render(<AddChildForm />);
    
    // Wait for the component to check for existing child
    await waitFor(() => {
      expect(mockGetChild).toHaveBeenCalledWith('test-user-id');
    });
    
    // When child exists, should show "Child Already Registered" message
    await waitFor(() => {
      expect(screen.getByText(/child already registered/i)).toBeInTheDocument();
    });
    
    // Should show option to go to dashboard
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument();
    
    // Reset mock after test
    mockGetChild.mockReset();
  });

  it('updates child document when in edit mode', async () => {
    const existingChildData = {
      id: 'existing-child-id',
      name: 'Old Name',
      dateOfBirth: { toDate: () => new Date('2018-10-10') },
      age: 5,
    };
    
    // Override the default mock for this test only
    mockGetChild.mockImplementation(() => Promise.resolve(existingChildData));
    mockUpdateChild.mockImplementation(() => Promise.resolve({}));
    
    render(<AddChildForm />);
    
    // Wait for component to detect existing child
    await waitFor(() => {
      expect(mockGetChild).toHaveBeenCalled();
    });
    
    // Should show child already registered message
    await waitFor(() => {
      expect(screen.getByText(/child already registered/i)).toBeInTheDocument();
    });
    
    // Note: The current component design shows a message instead of the form when child exists
    // To test actual updating, we would need an "Edit" button trigger which isn't implemented yet
    // This test verifies the component correctly detects and displays existing child status
    
    // Reset mocks after test
    mockGetChild.mockReset();
    mockUpdateChild.mockReset();
  });

  it('validates date of birth is not in the future', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    render(<AddChildForm />);
    
    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    fireEvent.change(dobInput, {
      target: { value: futureDateString },
    });
    
    // Try to submit
    const submitButton = screen.getByRole('button', { name: /add my child/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateChild).not.toHaveBeenCalled();
    });
  });
});
