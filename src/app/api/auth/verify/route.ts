import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken, createSession } from '@/lib/auth';
import { getBaseUrl } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const baseUrl = getBaseUrl();
  
  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=missing-token`);
  }
  
  try {
    const result = await verifyMagicToken(token);
    
    if (!result) {
      return NextResponse.redirect(`${baseUrl}/login?error=expired`);
    }
    
    await createSession(result.userId, result.email, result.plan, result.role);
    
    return NextResponse.redirect(`${baseUrl}/?loggedIn=true`);
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=failed`);
  }
}
