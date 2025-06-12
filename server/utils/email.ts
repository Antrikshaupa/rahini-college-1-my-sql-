import { randomBytes } from 'crypto';
import sgMail from '@sendgrid/mail';

// Email templates type
export type EmailTemplate = 
  | 'welcome'
  | 'newsletter'
  | 'confirmation'
  | 'password-reset'
  | 'unsubscribe';

/**
 * Generate a unique unsubscribe token
 */
export function generateUnsubscribeToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get HTML template for specific email type
 * @param template The email template type
 * @param data Data to populate the template
 */
function getTemplateHTML(template: EmailTemplate, data: Record<string, any> = {}): string {
  switch (template) {
    case 'welcome':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Welcome to Rahini College Newsletter</h1>
          </div>
          <p>Hello ${data.name ? data.name : 'there'},</p>
          <p>Thank you for subscribing to our newsletter. We're excited to keep you updated with all the latest news, events, and announcements from Rahini College of Art and Design.</p>
          <p>You'll receive updates on:</p>
          <ul>
            <li>Upcoming exhibitions and events</li>
            <li>New courses and programs</li>
            <li>Student achievements and alumni news</li>
            <li>Campus updates and announcements</li>
          </ul>
          <p>If you ever want to unsubscribe, you can click the unsubscribe link in any of our emails.</p>
          <p>Best regards,<br>The Rahini College Team</p>
        </div>
      `;
    
    case 'newsletter':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Rahini College Newsletter</h1>
          </div>
          <h2>${data.subject || 'Latest Updates'}</h2>
          ${data.content || ''}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>You're receiving this email because you subscribed to the Rahini College newsletter.</p>
            <p>If you no longer wish to receive these emails, you can <a href="${data.unsubscribeUrl || '#'}">unsubscribe here</a>.</p>
          </div>
        </div>
      `;
    
    case 'unsubscribe':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Unsubscribe Confirmation</h1>
          </div>
          <p>Hello,</p>
          <p>We're sorry to see you go! You have been successfully unsubscribed from the Rahini College newsletter.</p>
          <p>If you unsubscribed by mistake, you can always subscribe again from our website.</p>
          <p>Best regards,<br>The Rahini College Team</p>
        </div>
      `;
    
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Rahini College</h1>
          ${data.content || 'No content provided'}
        </div>
      `;
  }
}

/**
 * Send email using SendGrid
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  template,
  templateData = {}
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: EmailTemplate;
  templateData?: Record<string, any>;
}): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not found. Email not sent.');
    return false;
  }

  try {
    // Initialize SendGrid with API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Prepare email content
    const mailOptions = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@rahini.college',
      subject,
      text: text || '',
      html: html || (template ? getTemplateHTML(template, templateData) : ''),
    };
    
    // Send email
    await sgMail.send(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send welcome email to new subscribers
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to Rahini College Newsletter',
    template: 'welcome',
    templateData: { name }
  });
}

/**
 * Send newsletter email to subscribers
 */
export async function sendNewsletterEmail(
  email: string,
  subject: string,
  content: string,
  unsubscribeToken: string
): Promise<boolean> {
  const unsubscribeUrl = `${process.env.PUBLIC_URL || 'http://localhost:5000'}/api/unsubscribe/${unsubscribeToken}`;
  
  return sendEmail({
    to: email,
    subject,
    template: 'newsletter',
    templateData: {
      subject,
      content,
      unsubscribeUrl
    }
  });
}

/**
 * Send unsubscribe confirmation email
 */
export async function sendUnsubscribeConfirmation(
  email: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'You have been unsubscribed from Rahini College Newsletter',
    template: 'unsubscribe'
  });
}