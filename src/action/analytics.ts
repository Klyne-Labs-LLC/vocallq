"use server";

import { prismaClient } from "@/lib/prismaClient";
import { onAuthenticateUser } from "./auth";
import type { 
  WebinarAnalyticsData, 
  TranscriptDownloadData, 
  SpeakerAnalyticsResponse, 
  EngagementTimelinePoint,
  TranscriptSegmentData
} from "@/lib/assemblyai/types";

/**
 * Get comprehensive webinar analytics
 * Includes transcript, insights, segments, and live transcription data
 */
export const getWebinarAnalytics = async (webinarId: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    // Verify user has access to this webinar
    const webinar = await prismaClient.webinar.findFirst({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
      include: {
        presenter: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!webinar) {
      return { status: 404, message: "Webinar not found or access denied" };
    }

    // Get transcript with segments
    const transcript = await prismaClient.webinarTranscript.findFirst({
      where: { webinarId },
      include: {
        segments: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    // Get insights
    const insights = await prismaClient.webinarInsights.findFirst({
      where: { webinarId },
    });

    // Get live transcription data for real-time analysis
    const liveTranscriptions = await prismaClient.liveTranscription.findMany({
      where: { webinarId },
      orderBy: { turnOrder: 'asc' },
      take: 100, // Limit for performance
    });

    // Get attendance data with engagement metrics
    const attendanceData = await prismaClient.attendance.findMany({
      where: { webinarId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      status: 200,
      data: {
        webinar,
        transcript,
        insights,
        liveTranscriptions,
        attendanceData,
      },
    };
  } catch (error) {
    console.error("Error fetching webinar analytics:", error);
    return {
      status: 500,
      message: "Failed to fetch analytics data",
    };
  }
};

/**
 * Get webinar transcript for download
 * Returns formatted transcript with timestamps and speakers
 */
export const getTranscriptForDownload = async (webinarId: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    // Verify access
    const webinar = await prismaClient.webinar.findFirst({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        presenter: {
          select: { name: true },
        },
      },
    });

    if (!webinar) {
      return { status: 404, message: "Webinar not found or access denied" };
    }

    // Get transcript with segments
    const transcript = await prismaClient.webinarTranscript.findFirst({
      where: { webinarId },
      include: {
        segments: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!transcript) {
      return { status: 404, message: "Transcript not found" };
    }

    // Format transcript for download
    const formattedTranscript = {
      webinar: {
        title: webinar.title,
        presenter: webinar.presenter.name,
        date: webinar.startTime,
        duration: transcript.audioDuration,
      },
      transcript: {
        fullText: transcript.transcriptText,
        segments: transcript.segments.map(segment => ({
          timestamp: formatTimestamp(segment.startTime),
          speaker: segment.speaker || 'Unknown Speaker',
          text: segment.text,
          confidence: Math.round((segment.confidence || 0) * 100),
        })),
        confidence: Math.round((transcript.confidence || 0) * 100),
        processingTime: transcript.processingTime,
      },
      insights: transcript.autoHighlights ? {
        highlights: Array.isArray(transcript.autoHighlights) 
          ? transcript.autoHighlights 
          : (transcript.autoHighlights as any)?.results || [],
        sentiment: transcript.sentimentResults || [],
      } : null,
    };

    return {
      status: 200,
      data: formattedTranscript,
    };
  } catch (error) {
    console.error("Error preparing transcript download:", error);
    return {
      status: 500,
      message: "Failed to prepare transcript for download",
    };
  }
};

/**
 * Get speaker analytics for a webinar
 * Calculates speaking time, turn frequency, and engagement metrics per speaker
 */
export const getSpeakerAnalytics = async (webinarId: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    // Verify access
    const webinar = await prismaClient.webinar.findFirst({
      where: {
        id: webinarId,
        presenterId: user.user.id,
      },
    });

    if (!webinar) {
      return { status: 404, message: "Webinar not found or access denied" };
    }

    // Get transcript segments
    const segments = await prismaClient.transcriptSegment.findMany({
      where: {
        transcript: {
          webinarId,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Calculate speaker metrics
    const speakerMetrics = segments.reduce((acc, segment) => {
      const speaker = segment.speaker || 'Unknown Speaker';
      
      if (!acc[speaker]) {
        acc[speaker] = {
          name: speaker,
          totalTime: 0,
          turns: 0,
          avgConfidence: 0,
          totalConfidence: 0,
          segments: [],
          sentimentScores: [],
        };
      }

      const duration = segment.endTime - segment.startTime;
      acc[speaker].totalTime += duration;
      acc[speaker].turns += 1;
      acc[speaker].totalConfidence += segment.confidence || 0;
      acc[speaker].segments.push(segment);
      
      if (segment.sentiment !== null) {
        acc[speaker].sentimentScores.push(segment.sentiment);
      }

      return acc;
    }, {} as Record<string, {
      name: string;
      totalTime: number;
      turns: number;
      avgConfidence: number;
      totalConfidence: number;
      segments: TranscriptSegmentData[];
      sentimentScores: number[];
    }>);

    // Calculate averages and percentages
    const totalDuration = segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);
    
    const speakerAnalytics = Object.values(speakerMetrics).map((speaker) => ({
      ...speaker,
      avgConfidence: Math.round((speaker.totalConfidence / speaker.turns) * 100),
      speakingPercentage: Math.round((speaker.totalTime / totalDuration) * 100),
      avgSentiment: speaker.sentimentScores.length > 0 
        ? speaker.sentimentScores.reduce((sum, score) => sum + score, 0) / speaker.sentimentScores.length
        : 0,
      formattedTime: formatDuration(speaker.totalTime),
    })).sort((a, b) => b.totalTime - a.totalTime);

    return {
      status: 200,
      data: {
        speakers: speakerAnalytics,
        totalDuration: formatDuration(totalDuration),
        totalSpeakers: speakerAnalytics.length,
      },
    };
  } catch (error) {
    console.error("Error calculating speaker analytics:", error);
    return {
      status: 500,
      message: "Failed to calculate speaker analytics",
    };
  }
};

/**
 * Get engagement timeline for a webinar
 * Shows engagement patterns over time based on speaking patterns and sentiment
 */
export const getEngagementTimeline = async (webinarId: string) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    // Get segments and live transcriptions
    const segments = await prismaClient.transcriptSegment.findMany({
      where: {
        transcript: {
          webinarId,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Create timeline data points (5-minute intervals)
    const timelineData = [];
    const intervalMinutes = 5;
    const totalDuration = segments.reduce((max, seg) => Math.max(max, seg.endTime), 0);
    
    for (let time = 0; time < totalDuration; time += intervalMinutes * 60) {
      const intervalEnd = time + (intervalMinutes * 60);
      const intervalSegments = segments.filter(
        seg => seg.startTime >= time && seg.startTime < intervalEnd
      );

      if (intervalSegments.length > 0) {
        const avgSentiment = intervalSegments
          .filter(seg => seg.sentiment !== null)
          .reduce((sum, seg) => sum + (seg.sentiment || 0), 0) / 
          Math.max(intervalSegments.filter(seg => seg.sentiment !== null).length, 1);

        const speakerCount = new Set(intervalSegments.map(seg => seg.speaker)).size;
        const avgConfidence = intervalSegments.reduce((sum, seg) => sum + (seg.confidence || 0), 0) / intervalSegments.length;

        timelineData.push({
          time: formatTimestamp(time),
          timeSeconds: time,
          sentiment: avgSentiment,
          speakerCount,
          confidence: avgConfidence,
          engagement: Math.min(1, (speakerCount * intervalSegments.length) / 10), // Normalized engagement score
          segmentCount: intervalSegments.length,
        });
      }
    }

    return {
      status: 200,
      data: timelineData,
    };
  } catch (error) {
    console.error("Error generating engagement timeline:", error);
    return {
      status: 500,
      message: "Failed to generate engagement timeline",
    };
  }
};

// Helper functions
const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}; 