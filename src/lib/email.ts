import { getBaseUrl } from './utils';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendMagicLink(email: string, token: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const magicUrl = `${baseUrl}/auth/verify?token=${token}`;
  
  // If no Resend key configured, log the link for development
  if (!RESEND_API_KEY) {
    console.log('\n========================================');
    console.log('MAGIC LINK (dev mode - no email provider)');
    console.log(`Email: ${email}`);
    console.log(`Link: ${magicUrl}`);
    console.log('========================================\n');
    return true;
  }
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Is My SaaS Taken? <noreply@ismysaastaken.com>',
        to: email,
        subject: 'Your login link',
        html: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #141518; color: #ece6d6;">
            <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 24px; color: #ece6d6;">Sign in to Is My SaaS Taken?</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #8a8477; margin-bottom: 32px;">Click the button below to sign in. This link expires in 15 minutes.</p>
            <a href="${magicUrl}" style="display: inline-block; padding: 12px 32px; background: #e6a817; color: #141518; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 6px;">Sign in →</a>
            <p style="font-size: 12px; color: #5a564f; margin-top: 40px;">If you didn't request this, just ignore it.</p>
          </div>
        `,
      }),
    });
    
    return res.ok;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
}
