import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  getEmailTemplate, 
  getTemplateTypeFromUrl, 
  addTypeToResetUrl,
  type EmailTemplateType,
  type EmailTemplateData 
} from './template-utils';

// Mock fs module
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('template-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEmailTemplate', () => {
    const mockTemplateData: EmailTemplateData = {
      resetUrl: 'https://example.com/reset?token=abc123',
      userName: 'John Doe',
      userEmail: 'john@example.com'
    };

    const mockTemplateContent = `
      <html>
        <body>
          <h1>Hello {{userName}}</h1>
          <p>Email: {{userEmail}}</p>
          <a href="{{resetUrl}}">Reset Password</a>
        </body>
      </html>
    `;

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockTemplateContent);
    });

    it('should load and process forgot-password template correctly', () => {
      const result = getEmailTemplate('forgot-password', mockTemplateData);

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'lib', 'email-templates', 'forgot-password.html')
      );
      expect(result.subject).toBe('Reset Your Password');
      expect(result.html).toContain('Hello John Doe');
      expect(result.html).toContain('Email: john@example.com');
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should load and process new-user template correctly', () => {
      const result = getEmailTemplate('new-user', mockTemplateData);

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'lib', 'email-templates', 'new-user.html')
      );
      expect(result.subject).toBe('Welcome - Set Your Password');
      expect(result.html).toContain('Hello John Doe');
      expect(result.html).toContain('Email: john@example.com');
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should load and process admin-reset template correctly', () => {
      const result = getEmailTemplate('admin-reset', mockTemplateData);

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'lib', 'email-templates', 'admin-reset.html')
      );
      expect(result.subject).toBe('Password Reset Required');
      expect(result.html).toContain('Hello John Doe');
      expect(result.html).toContain('Email: john@example.com');
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should handle template without userName', () => {
      const dataWithoutUserName = {
        resetUrl: 'https://example.com/reset?token=abc123',
        userEmail: 'john@example.com'
      };

      const result = getEmailTemplate('forgot-password', dataWithoutUserName);

      expect(result.html).toContain('Hello {{userName}}'); // Should remain unreplaced
      expect(result.html).toContain('Email: john@example.com');
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should handle template without userEmail', () => {
      const dataWithoutUserEmail = {
        resetUrl: 'https://example.com/reset?token=abc123',
        userName: 'John Doe'
      };

      const result = getEmailTemplate('forgot-password', dataWithoutUserEmail);

      expect(result.html).toContain('Hello John Doe');
      expect(result.html).toContain('Email: {{userEmail}}'); // Should remain unreplaced
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should handle template with only resetUrl', () => {
      const minimalData = {
        resetUrl: 'https://example.com/reset?token=abc123'
      };

      const result = getEmailTemplate('forgot-password', minimalData);

      expect(result.html).toContain('Hello {{userName}}'); // Should remain unreplaced
      expect(result.html).toContain('Email: {{userEmail}}'); // Should remain unreplaced
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should replace multiple occurrences of template variables', () => {
      const templateWithMultipleVars = `
        <html>
          <body>
            <h1>Hello {{userName}}</h1>
            <p>Dear {{userName}}, your email {{userEmail}} is confirmed.</p>
            <a href="{{resetUrl}}">Reset</a>
            <p>Click {{resetUrl}} to continue.</p>
          </body>
        </html>
      `;

      mockFs.readFileSync.mockReturnValue(templateWithMultipleVars);

      const result = getEmailTemplate('forgot-password', mockTemplateData);

      // Check that all occurrences are replaced
      expect(result.html).toContain('Hello John Doe');
      expect(result.html).toContain('Dear John Doe, your email');
      expect(result.html).toContain('john@example.com is confirmed');
      expect(result.html).toContain('href="https://example.com/reset?token=abc123"');
      expect(result.html).toContain('Click https://example.com/reset?token=abc123 to continue');
    });

    it('should throw error when template file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        getEmailTemplate('forgot-password', mockTemplateData);
      }).toThrow('Email template not found: forgot-password');

      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('should handle all template types correctly', () => {
      const templateTypes: EmailTemplateType[] = ['forgot-password', 'new-user', 'admin-reset'];
      const expectedSubjects = {
        'forgot-password': 'Reset Your Password',
        'new-user': 'Welcome - Set Your Password',
        'admin-reset': 'Password Reset Required'
      };

      templateTypes.forEach(type => {
        const result = getEmailTemplate(type, mockTemplateData);
        expect(result.subject).toBe(expectedSubjects[type]);
        expect(result.html).toBeDefined();
        expect(typeof result.html).toBe('string');
      });
    });
  });

  describe('getTemplateTypeFromUrl', () => {
    it('should return "new-user" for typ=newusr', () => {
      const url = 'https://example.com/reset?token=abc123&typ=newusr';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('new-user');
    });

    it('should return "admin-reset" for typ=admreq', () => {
      const url = 'https://example.com/reset?token=abc123&typ=admreq';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('admin-reset');
    });

    it('should return "forgot-password" for typ=fgp', () => {
      const url = 'https://example.com/reset?token=abc123&typ=fgp';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('forgot-password');
    });

    it('should return "forgot-password" as default when typ is not provided', () => {
      const url = 'https://example.com/reset?token=abc123';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('forgot-password');
    });

    it('should return "forgot-password" as default for unknown typ values', () => {
      const url = 'https://example.com/reset?token=abc123&typ=unknown';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('forgot-password');
    });

    it('should handle URLs with multiple query parameters', () => {
      const url = 'https://example.com/reset?token=abc123&typ=newusr&other=value&another=param';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('new-user');
    });

    it('should handle URLs with typ as empty string', () => {
      const url = 'https://example.com/reset?token=abc123&typ=';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('forgot-password');
    });

    it('should handle URLs with different domains and paths', () => {
      const url = 'https://different-domain.com/different/path?typ=admreq';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('admin-reset');
    });

    it('should handle URLs with fragments', () => {
      const url = 'https://example.com/reset?typ=newusr#section';
      const result = getTemplateTypeFromUrl(url);
      expect(result).toBe('new-user');
    });

    it('should extract typ from URL-encoded callbackURL parameter', () => {
      const url = 'http://localhost:3000/api/auth/reset-password/jzZ1mAF2Z5LR3d0UquOLYyrB?callbackURL=%2Freset-password%3Ftyp%3Dnewusr';
      const result = getTemplateTypeFromUrl(url);
      // Should extract typ=newusr from the encoded callbackURL
      expect(result).toBe('new-user');
    });

    it('should extract typ from encoded callbackURL with admreq type', () => {
      const url = 'http://localhost:3000/api/auth/reset-password/token123?callbackURL=%2Freset-password%3Ftyp%3Dadmreq';
      const result = getTemplateTypeFromUrl(url);
      // Should extract typ=admreq from the encoded callbackURL
      expect(result).toBe('admin-reset');
    });

    it('should extract typ from encoded callbackURL with fgp type', () => {
      const url = 'http://localhost:3000/api/auth/reset-password/token123?callbackURL=%2Freset-password%3Ftyp%3Dfgp';
      const result = getTemplateTypeFromUrl(url);
      // Should extract typ=fgp from the encoded callbackURL
      expect(result).toBe('forgot-password');
    });

    it('should prioritize direct typ parameter over callbackURL typ', () => {
      // Test case where there's both a direct typ parameter and one in the encoded callbackURL
      const url = 'http://localhost:3000/api/auth/reset-password/token123?typ=newusr&callbackURL=%2Freset-password%3Ftyp%3Dadmreq';
      const result = getTemplateTypeFromUrl(url);
      // Should use the direct typ parameter first
      expect(result).toBe('new-user');
    });

    it('should handle callbackURL without typ parameter', () => {
      const url = 'http://localhost:3000/api/auth/reset-password/token123?callbackURL=%2Freset-password';
      const result = getTemplateTypeFromUrl(url);
      // Should default to forgot-password when no typ is found
      expect(result).toBe('forgot-password');
    });

    it('should handle malformed callbackURL gracefully', () => {
      const url = 'http://localhost:3000/api/auth/reset-password/token123?callbackURL=invalid-url';
      const result = getTemplateTypeFromUrl(url);
      // Should default to forgot-password when callbackURL parsing fails
      expect(result).toBe('forgot-password');
    });

    it('should handle relative URLs in callbackURL', () => {
      const url = 'http://localhost:3000/api/auth/reset-password/token123?callbackURL=%2Freset-password%3Ftyp%3Dnewusr%26other%3Dvalue';
      const result = getTemplateTypeFromUrl(url);
      // Should extract typ=newusr from relative URL in callbackURL
      expect(result).toBe('new-user');
    });
  });

  describe('addTypeToResetUrl', () => {
    it('should add fgp type to URL', () => {
      const baseUrl = 'https://example.com/reset?token=abc123';
      const result = addTypeToResetUrl(baseUrl, 'fgp');
      expect(result).toBe('https://example.com/reset?token=abc123&typ=fgp');
    });

    it('should add newusr type to URL', () => {
      const baseUrl = 'https://example.com/reset?token=abc123';
      const result = addTypeToResetUrl(baseUrl, 'newusr');
      expect(result).toBe('https://example.com/reset?token=abc123&typ=newusr');
    });

    it('should add admreq type to URL', () => {
      const baseUrl = 'https://example.com/reset?token=abc123';
      const result = addTypeToResetUrl(baseUrl, 'admreq');
      expect(result).toBe('https://example.com/reset?token=abc123&typ=admreq');
    });

    it('should add type to URL without existing query parameters', () => {
      const baseUrl = 'https://example.com/reset';
      const result = addTypeToResetUrl(baseUrl, 'newusr');
      expect(result).toBe('https://example.com/reset?typ=newusr');
    });

    it('should replace existing typ parameter', () => {
      const baseUrl = 'https://example.com/reset?token=abc123&typ=oldvalue';
      const result = addTypeToResetUrl(baseUrl, 'newusr');
      expect(result).toBe('https://example.com/reset?token=abc123&typ=newusr');
    });

    it('should preserve other query parameters', () => {
      const baseUrl = 'https://example.com/reset?token=abc123&other=value&another=param';
      const result = addTypeToResetUrl(baseUrl, 'admreq');
      expect(result).toBe('https://example.com/reset?token=abc123&other=value&another=param&typ=admreq');
    });

    it('should handle URLs with fragments', () => {
      const baseUrl = 'https://example.com/reset?token=abc123#section';
      const result = addTypeToResetUrl(baseUrl, 'fgp');
      expect(result).toBe('https://example.com/reset?token=abc123&typ=fgp#section');
    });

    it('should handle URLs with different domains and paths', () => {
      const baseUrl = 'https://different-domain.com/different/path?token=xyz789';
      const result = addTypeToResetUrl(baseUrl, 'newusr');
      expect(result).toBe('https://different-domain.com/different/path?token=xyz789&typ=newusr');
    });

    it('should handle localhost URLs', () => {
      const baseUrl = 'http://localhost:3000/reset?token=abc123';
      const result = addTypeToResetUrl(baseUrl, 'admreq');
      expect(result).toBe('http://localhost:3000/reset?token=abc123&typ=admreq');
    });
  });
});
