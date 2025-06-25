import {Resend} from 'resend';

const resend = new Resend('re_Nh5nFWUd_AL4gykhHq8DfZmcG8K6QQ6jB');

type EmailRequest = {
    to: string;
    subject: string;
    html: string;
}

export default async function sendEmail({to,subject,html}:EmailRequest) {
    let from = 'onboarding@resend.dev';
    try {
        const response = await resend.emails.send(
            {
                from: 'onboarding@resend.dev',
                to,
                subject,
                html
            });

        if (!response) {
            throw new Error('No response from email service');
        }
        if (response.error) {
            throw new Error(`Email service error: ${response.error}`);
        }
        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}