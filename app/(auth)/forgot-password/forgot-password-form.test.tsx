import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ForgotPasswordForm } from './forgot-password-form'
import '@testing-library/jest-dom/vitest';

describe('ForgotPasswordForm', () => {
  it('should render with correct title and button', () => {
    render(<ForgotPasswordForm />)
    
    // Check that the main title is present
    expect(screen.getByText('Forgot Your Password?')).toBeInTheDocument()
    
    // Check that the send reset link button is present
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })
})
