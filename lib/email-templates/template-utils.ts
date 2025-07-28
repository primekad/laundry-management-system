import fs from 'fs';
import path from 'path';

export type EmailTemplateType = 'forgot-password' | 'new-user' | 'admin-reset';

export interface EmailTemplateData {
  resetUrl: string;
  userName?: string;
  userEmail?: string;
}

/**
 * Load and process email template
 */
export function getEmailTemplate(
  type: EmailTemplateType,
  data: EmailTemplateData
): { subject: string; html: string } {
  const templatePath = path.join(process.cwd(), 'lib', 'email-templates', `${type}.html`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found: ${type}`);
  }

  let html = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace template variables
  html = html.replace(/\{\{resetUrl\}\}/g, data.resetUrl);
  if (data.userName) {
    html = html.replace(/\{\{userName\}\}/g, data.userName);
  }
  if (data.userEmail) {
    html = html.replace(/\{\{userEmail\}\}/g, data.userEmail);
  }

  // Generate appropriate subject based on template type
  const subjects = {
    'forgot-password': 'Reset Your Password',
    'new-user': 'Welcome - Set Your Password',
    'admin-reset': 'Password Reset Required'
  };

  return {
    subject: subjects[type],
    html
  };
}

/**
 * Determine email template type from URL query parameters
 * Looks for 'typ' parameter in the main URL or within the callbackURL parameter
 */
export function getTemplateTypeFromUrl(url: string): EmailTemplateType {
  const urlObj = new URL(url);
  
  // First check for direct typ parameter
  let typ = urlObj.searchParams.get('typ');
  
  // If not found, check within the callbackURL parameter
  if (!typ) {
    const callbackURL = urlObj.searchParams.get('callbackURL');
    if (callbackURL) {
      try {
        // Decode the callbackURL and parse it
        const decodedCallback = decodeURIComponent(callbackURL);
        const callbackUrlObj = new URL(decodedCallback, 'http://localhost'); // Use dummy base for relative URLs
        typ = callbackUrlObj.searchParams.get('typ');
      } catch (error) {
        // If parsing fails, continue with default behavior
        console.warn('Failed to parse callbackURL for typ parameter:', error);
      }
    }
  }
  
  switch (typ) {
    case 'newusr':
      return 'new-user';
    case 'admreq':
      return 'admin-reset';
    case 'fgp':
    default:
      return 'forgot-password';
  }
}

/**
 * Add query parameter to reset URL
 */
export function addTypeToResetUrl(baseUrl: string, type: 'fgp' | 'newusr' | 'admreq'): string {
  const url = new URL(baseUrl);
  url.searchParams.set('typ', type);
  return url.toString();
}
