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