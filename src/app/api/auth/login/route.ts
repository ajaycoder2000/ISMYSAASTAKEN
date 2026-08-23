import { NextRequest, NextResponse } from 'next/server';
import { generateMagicToken } from '@/lib/auth';
import { sendMagicLink } from '@/lib/email';
import { getBaseUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "That doesn't look like a valid email address." },
        { status: 400 }
      );
    }
    
    const token = await generateMagicToken(email.trim());
    await sendMagicLink(email.trim(), token);

    const baseUrl = getBaseUrl();
    const devMagicUrl = `${baseUrl}/auth/verify?token=${token}`;
    
    return NextResponse.json({
      success: true,
      message: 'Check your inbox. The link expires in 15 minutes.',
      devMagicUrl: !process.env.RESEND_API_KEY ? devMagicUrl : undefined,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong sending the login link. Try again.' },
      { status: 500 }
    );
  }
}
