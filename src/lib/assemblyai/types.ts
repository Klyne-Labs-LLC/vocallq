/**
 * Configuration for traditional transcription requests
 */
export interface TranscriptionConfig {
  auto_highlights: boolean;
  sentiment_analysis: boolean;
  speaker_labels: boolean;
  punctuate: boolean;
  format_text: boolean;
  language_code?: string;
}

/**
 * Configuration for Universal-Streaming real-time transcription
 */
export interface UniversalStreamingConfig {
  sample_rate: number;
  format_turns: boolean;
  min_end_of_turn_silence_when_confident: number; // For webinar optimization
  end_of_turn_confidence_threshold: number;
}

/**
 * Webinar analysis results derived from transcript
 */
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

/**
 * Live transcription turn data from Universal-Streaming
 */
export interface LiveTranscriptionTurn {
  turn_order: number;
  turn_is_formatted: boolean;
  end_of_turn: boolean;
  transcript: string;
  end_of_turn_confidence: number;
  words?: Array<{
    text: string;
    word_is_final: boolean;
    start: number;
    end: number;
    confidence: number;
  }>;
}

/**
 * Caption segment for display in UI
 */
export interface CaptionSegment {
  id: number;
  text: string;
  timestamp: number;
  confidence: number;
  isFormatted: boolean;
}

/**
 * Transcript segment from database
 */
export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence: number;
}

/**
 * Analytics data structures for webinar insights
 */
export interface WebinarAnalyticsData {
  webinar: {
    id: string;
    title: string;
    startTime: Date;
    presenter: {
      id: string;
      name: string;
      profileImage?: string;
    };
  };
  transcript?: {
    id: string;
    transcriptText?: string;
    confidence?: number;
    audioDuration?: number;
    segments: TranscriptSegmentData[];
    sentimentResults?: SentimentResult[];
    autoHighlights?: AutoHighlight[];
  };
  insights?: {
    id: string;
    questionCount?: number;
    engagementScore?: number;
    overallSentiment?: number;
    keyMoments?: KeyMoment[];
    topKeywords?: string[];
  };
  liveTranscriptions: LiveTranscriptionData[];
  attendanceData: AttendanceData[];
}

export interface TranscriptSegmentData {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
  speaker?: string;
  sentiment?: number;
}

export interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence?: number;
  text?: string;
}

export interface AutoHighlight {
  text: string;
  confidence?: number;
  timestamp?: string;
}

export interface KeyMoment {
  timestamp: string;
  type: string;
  description: string;
}

export interface LiveTranscriptionData {
  id: string;
  turnOrder: number;
  text: string;
  isFormatted: boolean;
  endOfTurn: boolean;
  timestamp: number;
  confidence?: number;
  speaker?: string;
}

export interface AttendanceData {
  id: string;
  attendedType: 'ATTENDED' | 'NOT_ATTENDED' | 'LEFT_EARLY';
  engagementLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  timeSpoken?: number;
  questionsAsked?: number;
  sentimentScore?: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SpeakerAnalytics {
  name: string;
  totalTime: number;
  turns: number;
  avgConfidence: number;
  speakingPercentage: number;
  avgSentiment: number;
  formattedTime: string;
  totalConfidence: number;
  segments: TranscriptSegmentData[];
  sentimentScores: number[];
}

export interface SpeakerAnalyticsResponse {
  speakers: SpeakerAnalytics[];
  totalDuration: string;
  totalSpeakers: number;
}

export interface EngagementTimelinePoint {
  time: string;
  timeSeconds: number;
  sentiment: number;
  speakerCount: number;
  confidence: number;
  engagement: number;
  segmentCount: number;
}

export interface TranscriptDownloadData {
  webinar: {
    title: string;
    presenter: string;
    date: Date;
    duration?: number;
  };
  transcript: {
    fullText?: string;
    segments: Array<{
      timestamp: string;
      speaker: string;
      text: string;
      confidence: number;
    }>;
    confidence: number;
    processingTime?: number;
  };
  insights?: {
    highlights: AutoHighlight[];
    sentiment: SentimentResult[];
  };
} 