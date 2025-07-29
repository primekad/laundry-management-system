import { Resend } from 'resend';
import { getEmailLogDatabase } from './email-log-db';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

type EmailRequest = {
    to: string;
    subject: string;
    html: string;
}

export default async function sendEmail({ to, subject, html }: EmailRequest) {
    // Get environment variables
    const sendActualEmail = process.env.SEND_ACTUAL_EMAIL === 'true';
    const onlySendTo = process.env.ONLY_SEND_TO;
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    // Override recipient if ONLY_SEND_TO is set
    const finalRecipient = onlySendTo || to;
    
    // Always log the email attempt
    if(!sendActualEmail) {
        const emailLogDb = getEmailLogDatabase();
        emailLogDb.logEmail({
            to: finalRecipient,
            subject,
            html
        });
        // Mark email as sent in the log
        emailLogDb.markEmailAsSent(finalRecipient, subject);
    }
    
    console.log(`Email ${sendActualEmail ? 'sending' : 'logging only'} to: ${finalRecipient}`);
    
    if (!sendActualEmail) {
        console.log('SEND_ACTUAL_EMAIL is false - email logged to database instead of sending');
        return;
    }
    
    try {
        const response = await resend.emails.send({
            from: fromEmail,
            to: finalRecipient,
            subject,
            html
        });

        if (!response) {
            throw new Error('No response from email service');
        }
        if (response.error) {
            throw new Error(`Email service error: ${response.error.message}`);
        }
        

        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}