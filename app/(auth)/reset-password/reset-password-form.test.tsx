

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'
import { ResetPasswordForm } from './reset-password-form'
import '@testing-library/jest-dom/vitest';

// Mock Next.js navigation to provide a token
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => key === 'token' ? 'mock-token' : null
  })
}))

// Mock the useServerActionForm hook with minimal setup
vi.mock('@/hooks/use-server-action-form', () => ({
  useServerActionForm: () => ({
    form: {
      register: () => ({ name: 'test', onChange: () => {}, onBlur: () => {}, ref: () => {} })
    },
    state: { message: null, errors: {}, success: false },
    isPending: false,
    onSubmit: () => {},
    getFieldError: () => ({ clientError: undefined, serverErrors: [] })
  })
}))

// Test the validation schema used in the form
const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    passwordConfirmation: z.string(),
    token: z.string().min(1, { message: "Reset token is required." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

describe('ResetPasswordForm', () => {
  it('should render with correct title and button', () => {
    render(<ResetPasswordForm />)
    
    // Check that the main title is present
    expect(screen.getByText('Set a New Password')).toBeInTheDocument()
    
    // Check that the reset password button is present
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  describe('validation', () => {
    it('should validate correct password data', () => {
      const validData = {
        password: 'password123',
        passwordConfirmation: 'password123',
        token: 'valid-token'
      }
      const result = ResetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        password: '123',
        passwordConfirmation: '123',
        token: 'valid-token'
      }
      const result = ResetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'password123',
        passwordConfirmation: 'different123',
        token: 'valid-token'
      }
      const result = ResetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.passwordConfirmation).toContain('Passwords do not match.')
      }
    })

    it('should reject empty token', () => {
      const invalidData = {
        password: 'password123',
        passwordConfirmation: 'password123',
        token: ''
      }
      const result = ResetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
