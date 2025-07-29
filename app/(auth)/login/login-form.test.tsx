import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './login-form';
import '@testing-library/jest-dom/vitest';

const ResizeObserverMock = vi.fn(()=>({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('LoginForm', () => {
  it('renders the login form correctly', () => {
    render(<LoginForm />);
    
    // Check for essential UI elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });


  it('displays the login button in normal state', () => {
    render(<LoginForm />);
    
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    expect(loginButton).toBeEnabled();
    expect(loginButton).not.toHaveTextContent(/signing in/i);
  });

});
