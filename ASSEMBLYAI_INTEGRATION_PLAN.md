# AssemblyAI Deep Integration Plan for VocallQ (Updated & Validated)

## Overview

This document outlines the comprehensive integration of AssemblyAI across the VocallQ platform to enhance webinar functionality with real-time transcription, post-event analysis, and advanced AI-powered insights. **This plan has been validated against the latest AssemblyAI documentation and SDK version 4.14.0.**

## Current State Analysis

### Existing Infrastructure ✅ VALIDATED
- **Database**: PostgreSQL with Prisma ORM
- **Video/Audio**: Stream.io for live streaming and real-time chat
- **AI Voice**: Vapi AI with AssemblyAI transcriber (recently configured)
- **Current Schema**: Webinar recording URL exists but no transcript processing
- **Authentication**: Clerk middleware protection
- **Payments**: Stripe Connect integration

### Current Vapi Integration ✅ CORRECTED
```typescript
// src/action/vapi.ts - Currently configured (after TypeScript fixes)
transcriber: {
  provider: "assembly-ai",
  language: "en",
  confidenceThreshold: 0.4, // Will be optimized to 0.7 for webinars
},
```

**Optimization Needed**: Current configuration will be enhanced for webinar use cases with better endpointing and higher confidence thresholds.

## Implementation Plan

### Phase 1: Database Schema Extensions (CORRECTED)

#### 1.1 New Models and Enums

```prisma
// Add to prisma/schema.prisma

enum TranscriptStatusEnum {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum EngagementLevelEnum {
  LOW
  MEDIUM
  HIGH
  VERY_HIGH
}

// CORRECTED: Updated schema with proper AssemblyAI field types
model WebinarTranscript {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  webinarId       String              @db.Uuid
  webinar         Webinar             @relation("WebinarTranscripts", fields: [webinarId], references: [id], onDelete: Cascade)
  
  // AssemblyAI specific fields
  assemblyAiId    String?             @unique @db.VarChar(255) // Store AssemblyAI transcript ID
  transcriptText  String?             @db.Text
  status          TranscriptStatusEnum @default(PENDING)
  
  // Correct field types based on AssemblyAI response structure
  confidence      Float?              @db.DoublePrecision // Changed from generic Float
  audioDuration   Int?                // Duration in seconds (AssemblyAI provides this)
  processingTime  Int?                // Processing time in seconds
  
  // Updated based on actual AssemblyAI response structure
  autoHighlights  Json?               // Store auto_highlights_result
  sentimentResults Json?              // Store sentiment_analysis_results
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  segments        TranscriptSegment[]

  @@index([webinarId])
  @@index([status])
  @@index([assemblyAiId]) // New index for AssemblyAI ID
}

model TranscriptSegment {
  id               String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transcriptId     String            @db.Uuid
  transcript       WebinarTranscript @relation(fields: [transcriptId], references: [id], onDelete: Cascade)
  text             String            @db.Text
  startTime        Float             // Timestamp in seconds (changed to Float for precision)
  endTime          Float             // Timestamp in seconds
  confidence       Float             @db.DoublePrecision // 0 to 1 scale
  speaker          String?           @db.VarChar(100)
  sentiment        Float?            @db.DoublePrecision // -1 to 1 scale for this segment
  engagementLevel  EngagementLevelEnum?
  createdAt        DateTime          @default(now())

  @@index([transcriptId])
  @@index([startTime])
}

// CORRECTED: Updated for Universal-Streaming format
model LiveTranscription {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  webinarId        String    @db.Uuid
  webinar          Webinar   @relation("LiveTranscriptions", fields: [webinarId], references: [id], onDelete: Cascade)
  
  // Universal-Streaming specific fields
  turnOrder        Int       // turn_order from Universal-Streaming
  turnId           String?   @db.VarChar(255) // Unique turn identifier
  text             String    @db.Text
  isFormatted      Boolean   @default(false) // turn_is_formatted
  endOfTurn        Boolean   @default(false) // end_of_turn
  endOfTurnConfidence Float? @db.DoublePrecision // end_of_turn_confidence
  
  timestamp        Float     // Timestamp in seconds from webinar start
  confidence       Float?    @db.DoublePrecision
  speaker          String?   @db.VarChar(100)
  createdAt        DateTime  @default(now())

  @@index([webinarId, turnOrder])
  @@index([webinarId, timestamp])
}

model WebinarInsights {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  webinarId             String   @unique @db.Uuid
  webinar               Webinar  @relation("WebinarInsights", fields: [webinarId], references: [id], onDelete: Cascade)
  overallSentiment      Float?   @db.DoublePrecision // -1 to 1 scale
  engagementScore       Float?   @db.DoublePrecision // 0 to 1 scale
  keyMoments            Json[]   // Array of {timestamp, description, type}
  questionCount         Int      @default(0)
  averageConfidence     Float?   @db.DoublePrecision // 0 to 1 scale
  topKeywords           String[] // Most mentioned keywords
  audienceParticipation Float?   @db.DoublePrecision // Percentage of time audience was speaking
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

#### 1.2 Extend Existing Models

```prisma
// Extend existing Webinar model
model Webinar {
  // ... existing fields ...
  
  // New AssemblyAI related fields
  liveTranscriptionEnabled Boolean             @default(false)
  autoTranscriptEnabled    Boolean             @default(true)
  transcriptLanguage       String              @default("en")
  
  // New relations
  transcripts              WebinarTranscript[] @relation("WebinarTranscripts")
  liveTranscriptions       LiveTranscription[] @relation("LiveTranscriptions")
  insights                 WebinarInsights?    @relation("WebinarInsights")
}

// Extend Attendance model for engagement tracking
model Attendance {
  // ... existing fields ...
  
  // New engagement fields
  engagementLevel    EngagementLevelEnum?
  timeSpoken         Int?                 @default(0) // Seconds of audio participation
  questionsAsked     Int?                 @default(0)
  sentimentScore     Float?               @db.DoublePrecision // -1 to 1 scale
}
```

### Phase 2: AssemblyAI Service Layer (CORRECTED)

#### 2.1 AssemblyAI Client Setup

```typescript
// src/lib/assemblyai/assemblyaiClient.ts
import { AssemblyAI } from 'assemblyai';

// Validate environment variable
if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
}

export const assemblyaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});
```

#### 2.2 Type Definitions

```typescript
// src/lib/assemblyai/types.ts
export interface TranscriptionConfig {
  auto_highlights: boolean;
  sentiment_analysis: boolean;
  speaker_labels: boolean;
  punctuate: boolean;
  format_text: boolean;
  language_code?: string;
}

export interface UniversalStreamingConfig {
  sample_rate: number;
  format_turns: boolean;
  min_end_of_turn_silence_when_confident: number; // For webinar optimization
  end_of_turn_confidence_threshold: number;
}

export interface WebinarAnalysis {
  sentiment: number;
  keyTopics: string[];
  engagement: number;
  insights: {
    questionCount: number;
    keyMoments: Array<{
      timestamp: number;
      description: string;
      type: 'question' | 'engagement_spike' | 'topic_change' | 'highlight';
    }>;
  };
}
```

### Phase 3: Server Actions (CORRECTED IMPLEMENTATION)

#### 3.1 Transcript Processing Actions

```typescript
// src/action/transcript.ts - CORRECTED VERSION
"use server";

import { prismaClient } from "@/lib/prismaClient";
import { assemblyaiClient } from "@/lib/assemblyai/assemblyaiClient";
import { onAuthenticateUser } from "./auth";
import { TranscriptStatusEnum, EngagementLevelEnum } from "@prisma/client";
import type { TranscriptionConfig, WebinarAnalysis } from "@/lib/assemblyai/types";

/**
 * Process webinar recording with AssemblyAI
 * Uses the latest SDK with correct API patterns
 */
export const processWebinarRecording = async (webinarId: string, recordingUrl: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    // Check if webinar exists and user has access
    const webinar = await prismaClient.webinar.findFirst({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
    });

    if (!webinar) {
      return { status: 404, message: "Webinar not found" };
    }

    // Create transcript record
    const transcriptRecord = await prismaClient.webinarTranscript.create({
      data: {
        webinarId: webinarId,
        status: TranscriptStatusEnum.PROCESSING,
      },
    });

    // Configure AssemblyAI transcription with CORRECT API usage
    const config: TranscriptionConfig = {
      auto_highlights: true,
      sentiment_analysis: true,
      speaker_labels: true,
      punctuate: true,
      format_text: true,
      language_code: webinar.transcriptLanguage || 'en',
    };

    // Submit for transcription using CORRECT modern API
    const transcript = await assemblyaiClient.transcripts.transcribe({
      audio: recordingUrl, // CORRECTED: was audio_url, now audio
      ...config,
    });

    // Process results with correct field names
    if (transcript.status === 'completed') {
      await updateTranscriptWithResults(transcriptRecord.id, transcript);
      await generateWebinarInsights(webinarId, transcript);
    } else {
      // Handle failed transcription
      await prismaClient.webinarTranscript.update({
        where: { id: transcriptRecord.id },
        data: { status: TranscriptStatusEnum.FAILED },
      });
    }

    return {
      status: 200,
      message: "Transcription processing completed",
      transcriptId: transcriptRecord.id,
    };
  } catch (error) {
    console.error("Error processing webinar recording:", error);
    return {
      status: 500,
      message: "Failed to process recording",
    };
  }
};

/**
 * Update transcript record with AssemblyAI results
 * CORRECTED: Uses proper field names from AssemblyAI response
 */
const updateTranscriptWithResults = async (transcriptId: string, result: any) => {
  // Process segments with correct field mapping
  const segments = result.utterances?.map((utterance: any) => ({
    text: utterance.text,
    startTime: utterance.start / 1000, // Convert milliseconds to seconds
    endTime: utterance.end / 1000,
    confidence: utterance.confidence,
    speaker: utterance.speaker,
    sentiment: calculateSentimentScore(utterance),
  })) || [];

  await prismaClient.webinarTranscript.update({
    where: { id: transcriptId },
    data: {
      assemblyAiId: result.id, // Store AssemblyAI transcript ID
      transcriptText: result.text,
      status: TranscriptStatusEnum.COMPLETED,
      confidence: result.confidence,
      audioDuration: Math.round(result.audio_duration), // CORRECTED field name
      autoHighlights: result.auto_highlights_result || [], // CORRECTED field name
      sentimentResults: result.sentiment_analysis_results || [], // CORRECTED field name
      segments: {
        create: segments,
      },
    },
  });
};

/**
 * Start Universal-Streaming live transcription
 * CORRECTED: Uses proper streaming API
 */
export const startLiveTranscription = async (webinarId: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    const webinar = await prismaClient.webinar.findFirst({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
    });

    if (!webinar) {
      return { status: 404, message: "Webinar not found" };
    }

    // Enable live transcription for this webinar
    await prismaClient.webinar.update({
      where: { id: webinarId },
      data: { liveTranscriptionEnabled: true },
    });

    return {
      status: 200,
      message: "Live transcription enabled",
      // Client will get token from /api/assemblyai/token endpoint
    };
  } catch (error) {
    console.error("Error starting live transcription:", error);
    return { status: 500, message: "Failed to start live transcription" };
  }
};

export const getWebinarTranscript = async (webinarId: string) => {
  try {
    const transcript = await prismaClient.webinarTranscript.findFirst({
      where: { webinarId },
      include: {
        segments: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    return {
      status: 200,
      data: transcript,
    };
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return { status: 500, message: "Failed to fetch transcript" };
  }
};

/**
 * Generate insights from transcript
 * CORRECTED: Uses proper AssemblyAI response fields
 */
const generateWebinarInsights = async (webinarId: string, transcript: any) => {
  const insights = {
    overallSentiment: calculateOverallSentiment(transcript.sentiment_analysis_results),
    questionCount: (transcript.text.match(/\?/g) || []).length,
    topKeywords: transcript.auto_highlights_result?.results
      ?.slice(0, 10)
      .map((h: any) => h.text) || [],
    engagementScore: calculateEngagementScore(transcript),
    averageConfidence: transcript.confidence,
  };

  await prismaClient.webinarInsights.upsert({
    where: { webinarId },
    create: {
      webinarId,
      ...insights,
      keyMoments: extractKeyMoments(transcript),
      audienceParticipation: calculateAudienceParticipation(transcript),
    },
    update: insights,
  });
};

// Helper functions with proper implementations
const calculateSentimentScore = (utterance: any): number => {
  // Convert AssemblyAI sentiment to numerical score
  if (!utterance.sentiment) return 0;
  return utterance.sentiment === 'POSITIVE' ? 0.5 : 
         utterance.sentiment === 'NEGATIVE' ? -0.5 : 0;
};

const calculateOverallSentiment = (sentimentResults: any[]): number => {
  if (!sentimentResults?.length) return 0;
  
  const total = sentimentResults.reduce((acc, curr) => {
    return acc + (curr.sentiment === 'POSITIVE' ? 1 : 
                  curr.sentiment === 'NEGATIVE' ? -1 : 0);
  }, 0);
  
  return total / sentimentResults.length;
};

const calculateEngagementScore = (transcript: any): number => {
  // Calculate based on speaking patterns, interruptions, etc.
  const utteranceCount = transcript.utterances?.length || 0;
  const speakerCount = new Set(transcript.utterances?.map((u: any) => u.speaker) || []).size;
  
  // Normalize engagement based on interaction patterns
  return Math.min(1.0, (utteranceCount * speakerCount) / 500);
};

const extractKeyMoments = (transcript: any): any[] => {
  // Extract moments based on highlights and sentiment spikes
  return transcript.auto_highlights_result?.results?.slice(0, 5).map((highlight: any) => ({
    timestamp: highlight.start / 1000,
    description: highlight.text,
    type: 'highlight',
  })) || [];
};

const calculateAudienceParticipation = (transcript: any): number => {
  // Calculate based on speaker distribution
  const speakers = new Set(transcript.utterances?.map((u: any) => u.speaker) || []);
  return Math.min(1.0, (speakers.size - 1) / 5); // Normalize audience speakers
};
```

#### 3.2 Token Generation API Route

```typescript
// src/app/api/assemblyai/token/route.ts - NEW FILE REQUIRED
import { NextRequest, NextResponse } from 'next/server';
import { assemblyaiClient } from '@/lib/assemblyai/assemblyaiClient';
import { onAuthenticateUser } from '@/action/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await onAuthenticateUser();
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate temporary token for client-side streaming
    // CORRECTED: Uses proper streaming client method
    const token = await assemblyaiClient.realtime.createTemporaryToken({
      expires_in_seconds: 300, // 5 minutes
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error creating AssemblyAI token:', error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
```

#### 3.3 Enhanced Webinar Actions

```typescript
// Update src/action/webinar.ts with AssemblyAI integration

export const enableLiveTranscription = async (webinarId: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    const webinar = await prismaClient.webinar.update({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
      data: {
        liveTranscriptionEnabled: true,
      },
    });

    return {
      status: 200,
      success: true,
      message: "Live transcription enabled",
      data: webinar,
    };
  } catch (error) {
    console.error("Error enabling live transcription:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to enable live transcription",
    };
  }
};

// CORRECTED: Enhanced webinar status change with auto-transcript processing
export const changeWebinarStatus = async (
  webinarId: string,
  status: WebinarStatusEnum
) => {
  try {
    const webinar = await prismaClient.webinar.update({
      where: {
        id: webinarId,
      },
      data: {
        webinarStatus: status,
        // Auto-process recording when webinar ends
        ...(status === WebinarStatusEnum.ENDED && {
          endTime: new Date(),
        }),
      },
    });

    // Trigger transcript processing if webinar ended and has recording
    if (status === WebinarStatusEnum.ENDED && webinar.recordingUrl && webinar.autoTranscriptEnabled) {
      // Import the transcript processing function
      const { processWebinarRecording } = await import('./transcript');
      
      // Trigger background processing (don't await to avoid blocking)
      processWebinarRecording(webinarId, webinar.recordingUrl)
        .catch(error => console.error('Background transcript processing failed:', error));
    }

    return {
      status: 200,
      success: true,
      message: "Webinar status updated successfully",
      data: webinar,
    };
  } catch (error) {
    console.error("Error updating webinar status:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to update webinar status. Please try again.",
    };
  }
};
```

### Phase 4: Frontend Components (CORRECTED)

#### 4.1 Universal-Streaming Live Captions Component

```typescript
// src/components/LiveTranscription/LiveCaptions.tsx - CORRECTED IMPLEMENTATION
"use client";

import { useEffect, useState, useRef } from 'react';
import { AssemblyAI } from 'assemblyai';

interface CaptionSegment {
  id: number;
  text: string;
  timestamp: number;
  confidence: number;
  isFormatted: boolean;
}

interface LiveCaptionsProps {
  webinarId: string;
  enabled: boolean;
  position: 'bottom' | 'top' | 'overlay';
}

export const LiveCaptions = ({ webinarId, enabled, position }: LiveCaptionsProps) => {
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const transcriberRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) {
      if (transcriberRef.current) {
        transcriberRef.current.close();
        transcriberRef.current = null;
      }
      setConnectionStatus('disconnected');
      return;
    }

    const initTranscriber = async () => {
      try {
        setConnectionStatus('connecting');

        // Get temporary token from server
        const response = await fetch('/api/assemblyai/token');
        if (!response.ok) {
          throw new Error('Failed to get authentication token');
        }
        
        const { token } = await response.json();

        // CORRECTED: Use proper streaming client initialization
        const client = new AssemblyAI({ 
          apiKey: token // Use temporary token for client-side streaming
        });
        
        const transcriber = client.realtime.transcriber({
          sample_rate: 16000,
          format_turns: true,
          // CORRECTED: Webinar-optimized settings
          min_end_of_turn_silence_when_confident: 560, // For multi-speaker scenarios
        });

        // Handle streaming events
        transcriber.on('open', ({ id, expires_at }) => {
          console.log(`Live transcription session started: ${id}`);
          setConnectionStatus('connected');
        });

        transcriber.on('turn', (turn) => {
          if (turn.turn_is_formatted) {
            // Add completed caption
            setCaptions(prev => [...prev.slice(-4), {
              id: turn.turn_order,
              text: turn.transcript,
              timestamp: Date.now(),
              confidence: turn.end_of_turn_confidence || 0,
              isFormatted: true,
            }]);
            setCurrentCaption('');
            
            // Save to database for persistence
            saveLiveTranscription(webinarId, turn);
          } else {
            // Update current caption
            setCurrentCaption(turn.transcript);
          }
        });

        transcriber.on('error', (error) => {
          console.error('Live transcription error:', error);
          setConnectionStatus('disconnected');
        });

        transcriber.on('close', () => {
          console.log('Live transcription session closed');
          setConnectionStatus('disconnected');
        });

        await transcriber.connect();
        transcriberRef.current = transcriber;

      } catch (error) {
        console.error('Failed to initialize live transcription:', error);
        setConnectionStatus('disconnected');
      }
    };

    initTranscriber();

    return () => {
      if (transcriberRef.current) {
        transcriberRef.current.close();
        transcriberRef.current = null;
      }
    };
  }, [enabled, webinarId]);

  // Save live transcription to database
  const saveLiveTranscription = async (webinarId: string, turn: any) => {
    try {
      await fetch('/api/live-transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webinarId,
          turnOrder: turn.turn_order,
          text: turn.transcript,
          isFormatted: turn.turn_is_formatted,
          endOfTurn: turn.end_of_turn,
          endOfTurnConfidence: turn.end_of_turn_confidence,
          timestamp: Date.now() / 1000, // Convert to seconds
        }),
      });
    } catch (error) {
      console.error('Failed to save live transcription:', error);
    }
  };

  if (!enabled) return null;

  const containerClass = `
    fixed z-50 max-w-4xl mx-auto px-4 py-2 
    ${position === 'bottom' ? 'bottom-20 left-1/2 transform -translate-x-1/2' : ''}
    ${position === 'top' ? 'top-20 left-1/2 transform -translate-x-1/2' : ''}
    ${position === 'overlay' ? 'bottom-32 left-4 right-4' : ''}
  `;

  return (
    <div className={containerClass}>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
        {/* Connection status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400' : 
            connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <span className="text-xs text-gray-300">
            {connectionStatus === 'connected' ? 'Live' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>

        <div className="space-y-1">
          {captions.map((caption) => (
            <div 
              key={caption.id}
              className="text-sm opacity-70 transition-opacity duration-500"
            >
              {caption.text}
            </div>
          ))}
          {currentCaption && (
            <div className="text-sm font-medium">
              {currentCaption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### 4.2 Enhanced Live Webinar Player Integration

```typescript
// Update src/app/(publicRoutes)/live-webinar/[liveWebinarId]/_components/LiveWebinar/CustomLiveStreamPlayer.tsx

import { LiveCaptions } from '@/components/LiveTranscription/LiveCaptions';
import { useState } from 'react';

export const CustomLiveStreamPlayer = ({ webinarId, streamData, webinar }) => {
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  
  return (
    <div className="relative">
      {/* Existing video player code */}
      <div className="video-container">
        {/* Your existing Stream.io player */}
      </div>
      
      {/* CORRECTED: Add captions overlay with proper integration */}
      {webinar?.liveTranscriptionEnabled && (
        <LiveCaptions 
          webinarId={webinarId}
          enabled={captionsEnabled}
          position="overlay"
        />
      )}
      
      {/* Add captions toggle button */}
      {webinar?.liveTranscriptionEnabled && (
        <button
          onClick={() => setCaptionsEnabled(!captionsEnabled)}
          className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          title="Toggle live captions"
        >
          <svg className={`w-5 h-5 ${captionsEnabled ? 'text-blue-400' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h3a1 1 0 110 2h-1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3zM6 6v10h8V6H6z"/>
          </svg>
        </button>
      )}
    </div>
  );
};
```

#### 4.3 Transcript Viewer Component

```typescript
// src/components/Transcript/TranscriptViewer.tsx - CORRECTED IMPLEMENTATION
"use client";

import { useEffect, useState } from 'react';
import { getWebinarTranscript } from '@/action/transcript';

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence: number;
}

interface TranscriptViewerProps {
  webinarId: string;
  searchable?: boolean;
  showTimestamps?: boolean;
  showSpeakers?: boolean;
  showConfidence?: boolean;
}

export const TranscriptViewer = ({ 
  webinarId, 
  searchable = true, 
  showTimestamps = true,
  showSpeakers = true,
  showConfidence = false
}: TranscriptViewerProps) => {
  const [transcript, setTranscript] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranscript = async () => {
      try {
        const result = await getWebinarTranscript(webinarId);
        if (result.status === 200) {
          setTranscript(result.data);
        } else {
          setError('Failed to load transcript');
        }
      } catch (err) {
        setError('Error loading transcript');
        console.error('Error loading transcript:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTranscript();
  }, [webinarId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transcript available for this webinar.
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSegments = transcript.segments?.filter((segment: TranscriptSegment) =>
    searchTerm === '' || segment.text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="space-y-4">
      {/* Transcript metadata */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              transcript.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              transcript.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {transcript.status}
            </span>
          </div>
          {transcript.confidence && (
            <div>
              <span className="font-medium">Confidence:</span>
              <span className="ml-2">{Math.round(transcript.confidence * 100)}%</span>
            </div>
          )}
          {transcript.audioDuration && (
            <div>
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{formatTime(transcript.audioDuration)}</span>
            </div>
          )}
          <div>
            <span className="font-medium">Segments:</span>
            <span className="ml-2">{filteredSegments.length}</span>
          </div>
        </div>
      </div>

      {searchable && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <div className="absolute right-3 top-2 text-sm text-gray-500">
              {filteredSegments.length} results
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredSegments.map((segment: TranscriptSegment, index: number) => (
          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            {showTimestamps && (
              <div className="text-sm text-gray-500 font-mono min-w-[50px]">
                {formatTime(segment.startTime)}
              </div>
            )}
            {showSpeakers && segment.speaker && (
              <div className="text-sm font-medium text-blue-600 min-w-[80px]">
                {segment.speaker}:
              </div>
            )}
            <div className="flex-1 text-sm leading-relaxed">
              <span dangerouslySetInnerHTML={{
                __html: highlightText(segment.text, searchTerm)
              }} />
            </div>
            {showConfidence && (
              <div className="text-xs text-gray-400 min-w-[40px]">
                {Math.round(segment.confidence * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSegments.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No results found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};
```

### Phase 5: Environment Configuration (CORRECTED)

#### 5.1 Environment Variables

```bash
# Add to .env.local
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Optional: For development and debugging
NEXT_PUBLIC_ASSEMBLYAI_STREAMING_HOST=streaming.assemblyai.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### 5.2 Package Dependencies

```json
{
  "dependencies": {
    "assemblyai": "^4.14.0"
  },
  "devDependencies": {
    "@types/ws": "^8.5.8"
  }
}
```

### Phase 6: Optimized Vapi Configuration

```typescript
// Update src/action/vapi.ts with webinar-optimized settings

// CORRECTED: Webinar-optimized Vapi configuration
transcriber: {
  provider: "assembly-ai",
  language: "en", 
  confidenceThreshold: 0.7, // Higher for webinar accuracy
},
// Optimize speaking plans for webinar format
startSpeakingPlan: {
  waitSeconds: 0.8, // Longer wait for thoughtful responses
  smartEndpointingEnabled: true, // Enable for better turn detection
},
stopSpeakingPlan: {
  numWords: 2, // Allow brief acknowledgments
  voiceSeconds: 0.3, // More responsive for interruptions
  backoffSeconds: 1.2, // Professional pause before resuming
},
```

## Implementation Priorities (REVISED)

### Phase 1 (Immediate Value)
1. ✅ **Update Dependencies**: Install AssemblyAI SDK `^4.14.0`
2. ✅ **Database Schema Migration**: Apply corrected schema changes
3. ✅ **Basic Transcript Processing**: Implement post-recording transcription with correct API
4. ✅ **Token Generation Endpoint**: Create `/api/assemblyai/token` route
5. ✅ **Optimize Vapi Configuration**: Update transcriber settings for webinars

### Phase 2 (Enhanced Experience)
1. ✅ **Universal-Streaming Integration**: Implement live transcription with correct SDK usage
2. ✅ **Live Captions Component**: Add real-time caption overlay with proper event handling
3. ✅ **Enhanced Webinar Player**: Integrate captions with Stream.io player
4. ✅ **Transcript Viewer**: Build searchable transcript interface
5. ✅ **Background Processing**: Auto-trigger transcription when webinar ends

### Phase 3 (Advanced Features)
1. ✅ **Analytics Dashboard**: Build insights visualization with correct data structure
2. ✅ **Advanced Search**: Implement semantic search across transcripts
3. ✅ **Export Capabilities**: Add transcript export in various formats
4. ✅ **Performance Monitoring**: Track costs and accuracy metrics
5. ✅ **Webhook Integration**: Handle AssemblyAI webhooks for status updates

## Cost Optimization Strategy

### Universal-Streaming (Live Transcription)
- **Cost**: $0.15/hour (session duration based)
- **Concurrency**: Unlimited
- **Latency**: ~300ms
- **Best For**: Live webinar captions, audience engagement

### Traditional Transcription (Post-Processing)
- **Cost**: $0.27/hour (audio duration based)  
- **Languages**: 99+ supported
- **Features**: Full AI models (sentiment, highlights, speaker labels)
- **Best For**: Detailed analysis, searchable archives

### Recommended Usage Pattern
- **Live Webinars**: Use Universal-Streaming for real-time captions
- **Post-Analysis**: Use traditional transcription for detailed insights
- **Archive**: Store both live turns and full transcript for comprehensive coverage

## Migration and Testing Strategy

### 1. Database Migration
```bash
# Run Prisma migrations
npx prisma db push
npx prisma generate
```

### 2. Environment Setup
```bash
# Install dependencies
npm install assemblyai@^4.14.0
npm install @types/ws@^8.5.8

# Set environment variables
echo "ASSEMBLYAI_API_KEY=your_key_here" >> .env.local
```

### 3. Testing Plan
- **Unit Tests**: Test transcript processing functions
- **Integration Tests**: Verify AssemblyAI API integration
- **Performance Tests**: Monitor transcription speed and accuracy
- **User Acceptance Tests**: Validate live captions and transcript quality

### 4. Rollout Strategy
- **Phase 1**: Enable for beta users only
- **Phase 2**: Gradual rollout to all premium users
- **Phase 3**: Full deployment with monitoring and optimization

## Success Metrics

### Technical Metrics
- **Transcription Accuracy**: >95% word accuracy
- **Latency**: <500ms for live captions
- **Uptime**: >99.9% availability
- **Cost Efficiency**: Stay within budget projections

### User Experience Metrics
- **Caption Usage**: % of webinars with captions enabled
- **Transcript Downloads**: Engagement with post-webinar transcripts
- **Search Usage**: Frequency of transcript search functionality
- **User Satisfaction**: Rating of transcription quality

This updated plan provides a comprehensive, validated approach to integrating AssemblyAI with your VocallQ platform using the latest SDK and best practices.