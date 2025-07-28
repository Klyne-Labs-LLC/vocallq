import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prismaClient';
import { onAuthenticateUser } from '@/action/auth';

/**
 * Save live transcription data from Universal-Streaming
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await onAuthenticateUser();
    if (!user.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      webinarId,
      turnOrder,
      text,
      isFormatted,
      endOfTurn,
      endOfTurnConfidence,
      timestamp
    } = body;

    // Validate required fields
    if (!webinarId || !text || turnOrder === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Verify user has access to this webinar
    const webinar = await prismaClient.webinar.findFirst({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found or access denied' }, 
        { status: 404 }
      );
    }

    // Save live transcription to database
    const liveTranscription = await prismaClient.liveTranscription.create({
      data: {
        webinarId,
        turnOrder,
        text,
        isFormatted: isFormatted || false,
        endOfTurn: endOfTurn || false,
        endOfTurnConfidence: endOfTurnConfidence || null,
        timestamp: timestamp || Date.now() / 1000,
      },
    });

    return NextResponse.json({ 
      success: true,
      id: liveTranscription.id 
    });

  } catch (error) {
    console.error('Error saving live transcription:', error);
    return NextResponse.json(
      { error: 'Failed to save live transcription' }, 
      { status: 500 }
    );
  }
} 