import nodemailer from 'nodemailer';

// Types
interface EmailTemplates {
  launchAnnouncement: (name?: string) => string;
  waitlistConfirmation: (email: string) => string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

// Create a test account if in development
const createTransporter = () => {
  // In development, use ethereal.email for testing
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'maddison53@ethereal.email',
        pass: 'jn7jnAPss4f63QBpEu'
      }
    });
  }

  // In production or if SMTP config is provided
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_AUTH_USER || '',
      pass: process.env.SMTP_AUTH_PASS || '',
    },
  });
};

const transporter = createTransporter();

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to take our messages');
  }
});

// Email templates
const emailTemplates: EmailTemplates = {
  launchAnnouncement: (name = 'there') => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Toivo is Live! 🎉</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>We're thrilled to announce that <strong>Toivo</strong> is now officially live! 🚀</p>
        <p>As a valued member of our waitlist, we wanted to give you early access to start transforming your productivity.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://toivoapp.com'}" 
             style="display: inline-block; background-color: #4f46e5; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                    font-weight: bold;">
            Get Started with Toivo
          </a>
        </div>
        
        <p>Thanks for your patience and support!</p>
        <p>Best regards,<br>The Toivo Team</p>
      </div>
    </div>
  `,
  
  waitlistConfirmation: (email: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 You're on the list!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi there,</p>
        <p>Thank you for joining the Toivo waitlist with <strong>${email}</strong>.</p>
        <p>We'll notify you as soon as we launch. Get ready to boost your productivity!</p>
        
        <p>In the meantime, follow us on social media for updates and productivity tips.</p>
        
        <p>Best regards,<br>The Toivo Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Toivo. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
};

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const mailOptions = {
      from: options.from || `"Toivo Team" <${process.env.SMTP_FROM_EMAIL || 'noreply@toivoapp.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send launch announcement email
 */
export async function sendLaunchEmail(to: string, name?: string) {
  const subject = '🚀 Toivo is Live! Start Your Productivity Journey';
  const text = `Hi ${name || 'there'},\n\nWe're excited to let you know that Toivo is now live and ready for you to use!\n\n` +
    `Visit ${process.env.FRONTEND_URL || 'https://toivoapp.com'} to get started.\n\n` +
    'Thanks for your patience and support!\n\n' +
    'Best regards,\nThe Toivo Team';
    
  return sendEmail({
    to,
    subject,
    text,
    html: emailTemplates.launchAnnouncement(name)
  });
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmationEmail(email: string) {
  const subject = '🎉 Welcome to the Toivo Waitlist!';
  const text = `Thank you for joining the Toivo waitlist with ${email}.\n\n` +
    "We'll notify you as soon as we launch. Get ready to boost your productivity!\n\n" +
    'In the meantime, follow us on social media for updates and productivity tips.\n\n' +
    'Best regards,\nThe Toivo Team';
    
  return sendEmail({
    to: email,
    subject,
    text,
    html: emailTemplates.waitlistConfirmation(email)
  });
}
