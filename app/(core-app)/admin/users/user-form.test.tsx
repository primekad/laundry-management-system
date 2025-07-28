import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserForm } from './user-form';
import type { User } from '@/lib/definitions';
import type { Branch } from '@prisma/client';

// Mock the server actions
vi.mock('./actions', () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock React Hook Form components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div data-testid="form">{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({ render }: { render: ({ field }: { field: any }) => React.ReactNode }) => 
    render({ field: { onChange: vi.fn(), value: '' } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));

// Mock React Hook Form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: Function) => (e: Event) => {
      e.preventDefault();
      fn({});
    },
    setValue: vi.fn(),
    getValues: () => ({}),
  }),
  Controller: ({ render }: { render: ({ field }: { field: any }) => React.ReactNode }) => 
    render({ field: { onChange: vi.fn(), value: '' } }),
}));

// Mock zodResolver
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}));

// Mock useActionState
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: () => [{ message: null, errors: {}, success: false }, vi.fn()],
  };
});

// Mock useServerActionForm hook
vi.mock('@/hooks/use-server-action-form', () => ({
  useServerActionForm: () => ({
    form: {
      control: {},
      handleSubmit: (fn: Function) => (e: Event) => {
        e.preventDefault();
        fn({});
      },
      setValue: vi.fn(),
      getValues: () => ({}),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      formState: { errors: {} },
    },
    state: { message: null, errors: {}, success: false },
    isPending: false,
    getFieldError: () => ({ hasError: false, clientError: null, serverErrors: [] }),
  }),
}));

const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Main Branch',
    address: '123 Main St',
    phone: '555-0001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'branch-2',
    name: 'Secondary Branch',
    address: '456 Oak Ave',
    phone: '555-0002',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  firstName: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  emailVerified: true,
  image: null,
  phoneNumber: '555-1234',
  role: 'staff',
  defaultBranchId: 'branch-1',
  defaultBranch: mockBranches[0],
  banned: false,
  isActive: true,
  banReason: null,
  banExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedBranches: [mockBranches[0]],
};

describe('UserForm', () => {
  describe('Create Mode', () => {
    it('renders create user form', () => {
      render(
        <UserForm
          branches={mockBranches}
          intent="create"
        />
      );

      // Check for the title specifically (not the button)
      expect(screen.getAllByText('Create User')).toHaveLength(2); // Title and button
      expect(screen.getByText('Enter the details for the new user.')).toBeInTheDocument();
    });

    it('renders basic form fields', () => {
      render(
        <UserForm
          branches={mockBranches}
          intent="create"
        />
      );

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Surname')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders create button', () => {
      render(
        <UserForm
          branches={mockBranches}
          intent="create"
        />
      );

      expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders edit user form', () => {
      render(
        <UserForm
          user={mockUser}
          branches={mockBranches}
          intent="edit"
        />
      );

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByText('Update the details for this user.')).toBeInTheDocument();
    });

    it('renders update button', () => {
      render(
        <UserForm
          user={mockUser}
          branches={mockBranches}
          intent="edit"
        />
      );

      expect(screen.getByRole('button', { name: 'Update User' })).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('renders form with proper data-testid', () => {
      render(
        <UserForm
          branches={mockBranches}
          intent="create"
        />
      );

      expect(screen.getByTestId('form')).toBeInTheDocument();
    });

    it('renders cancel link', () => {
      render(
        <UserForm
          branches={mockBranches}
          intent="create"
        />
      );

      expect(screen.getByRole('link', { name: 'Cancel' })).toBeInTheDocument();
    });
  });
});
