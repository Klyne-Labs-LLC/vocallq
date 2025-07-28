"use server";

import { prismaClient } from "@/lib/prismaClient";
import { assemblyaiClient } from "@/lib/assemblyai/assemblyaiClient";
import { onAuthenticateUser } from "./auth";
import { TranscriptStatusEnum } from "@prisma/client";
import type { TranscriptionConfig } from "@/lib/assemblyai/types";

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
      return { status: 404, message: "Webinar not found or access denied" };
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
const updateTranscriptWithResults = async (transcriptId: string, result: Record<string, unknown>) => {
  // Process segments with correct field mapping
  const utterances = result.utterances as Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker: string;
    sentiment?: string;
  }> || [];

  const segments = utterances.map((utterance) => ({
    text: utterance.text,
    startTime: utterance.start / 1000, // Convert milliseconds to seconds
    endTime: utterance.end / 1000,
    confidence: utterance.confidence,
    speaker: utterance.speaker,
    sentiment: calculateSentimentScore(utterance),
  }));

  await prismaClient.webinarTranscript.update({
    where: { id: transcriptId },
    data: {
      assemblyAiId: result.id as string, // Store AssemblyAI transcript ID
      transcriptText: result.text as string,
      status: TranscriptStatusEnum.COMPLETED,
      confidence: result.confidence as number,
      audioDuration: Math.round(result.audio_duration as number), // CORRECTED field name
      autoHighlights: (result.auto_highlights_result as Record<string, unknown>[]) || [], // CORRECTED field name
      sentimentResults: (result.sentiment_analysis_results as Record<string, unknown>[]) || [], // CORRECTED field name
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
      return { status: 404, message: "Webinar not found or access denied" };
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

/**
 * Get webinar transcript with segments
 */
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
const generateWebinarInsights = async (webinarId: string, transcript: Record<string, unknown>) => {
  const sentimentResults = transcript.sentiment_analysis_results as Array<{
    sentiment: string;
  }> || [];

  const autoHighlights = transcript.auto_highlights_result as {
    results?: Array<{
      text: string;
      start: number;
    }>;
  };

  const insights = {
    overallSentiment: calculateOverallSentiment(sentimentResults),
    questionCount: ((transcript.text as string)?.match(/\?/g) || []).length,
    topKeywords: autoHighlights?.results
      ?.slice(0, 10)
      .map((h) => h.text) || [],
    engagementScore: calculateEngagementScore(transcript),
    averageConfidence: transcript.confidence as number,
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
const calculateSentimentScore = (utterance: { sentiment?: string }): number => {
  // Convert AssemblyAI sentiment to numerical score
  if (!utterance.sentiment) return 0;
  return utterance.sentiment === 'POSITIVE' ? 0.5 : 
         utterance.sentiment === 'NEGATIVE' ? -0.5 : 0;
};

const calculateOverallSentiment = (sentimentResults: Array<{ sentiment: string }>): number => {
  if (!sentimentResults?.length) return 0;
  
  const total = sentimentResults.reduce((acc, curr) => {
    return acc + (curr.sentiment === 'POSITIVE' ? 1 : 
                  curr.sentiment === 'NEGATIVE' ? -1 : 0);
  }, 0);
  
  return total / sentimentResults.length;
};

const calculateEngagementScore = (transcript: Record<string, unknown>): number => {
  // Calculate based on speaking patterns, interruptions, etc.
  const utterances = transcript.utterances as Array<{ speaker: string }> || [];
  const utteranceCount = utterances.length;
  const speakerCount = new Set(utterances.map((u) => u.speaker)).size;
  
  // Normalize engagement based on interaction patterns
  return Math.min(1.0, (utteranceCount * speakerCount) / 500);
};

const extractKeyMoments = (transcript: Record<string, unknown>): Array<Record<string, unknown>> => {
  // Extract moments based on highlights and sentiment spikes
  const autoHighlights = transcript.auto_highlights_result as {
    results?: Array<{
      start: number;
      text: string;
    }>;
  };

  return autoHighlights?.results?.slice(0, 5).map((highlight) => ({
    timestamp: highlight.start / 1000,
    description: highlight.text,
    type: 'highlight',
  })) || [];
};

const calculateAudienceParticipation = (transcript: Record<string, unknown>): number => {
  // Calculate based on speaker distribution
  const utterances = transcript.utterances as Array<{ speaker: string }> || [];
  const speakers = new Set(utterances.map((u) => u.speaker));
  return Math.min(1.0, (speakers.size - 1) / 5); // Normalize audience speakers
}; 