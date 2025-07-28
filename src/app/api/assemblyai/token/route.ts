import { NextRequest, NextResponse } from 'next/server';
import { assemblyaiClient } from '@/lib/assemblyai/assemblyaiClient';
import { onAuthenticateUser } from '@/action/auth';

/**
 * Generate temporary AssemblyAI token for client-side streaming
 * Requires user authentication to prevent unauthorized access
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user first
    const user = await onAuthenticateUser();
    if (!user.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Generate temporary token for client-side streaming
    // Token expires in 5 minutes for security
    const token = await assemblyaiClient.realtime.createTemporaryToken({
      expires_in_seconds: 300, // 5 minutes
    });

    return NextResponse.json({ 
      token,
      expiresIn: 300,
      userId: user.user.id // For logging purposes
    });

  } catch (error) {
    console.error('Error creating AssemblyAI token:', error);
    
    // Check if it's an AssemblyAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'AssemblyAI configuration error' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create authentication token' }, 
      { status: 500 }
    );
  }
} 