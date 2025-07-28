"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { getSpeakerAnalytics } from '@/action/analytics';
import { toast } from 'sonner';

interface SpeakerBreakdownProps {
  webinarId: string;
}

export const SpeakerBreakdown = ({ webinarId }: SpeakerBreakdownProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [speakerData, setSpeakerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const result = await getSpeakerAnalytics(webinarId);
        if (result.status === 200 && result.data) {
          setSpeakerData(result.data);
        } else {
          toast.error(result.message || 'Failed to load speaker analytics');
        }
      } catch (error) {
        console.error('Error fetching speaker analytics:', error);
        toast.error('Failed to load speaker analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, [webinarId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!speakerData || !speakerData.speakers || speakerData.speakers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No speaker analytics data available for this webinar.</p>
        </CardContent>
      </Card>
    );
  }

  const { speakers, totalDuration, totalSpeakers } = speakerData;

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600';
    if (sentiment < -0.2) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpeakers}</div>
            <p className="text-xs text-muted-foreground">Identified speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration}</div>
            <p className="text-xs text-muted-foreground">Speaking time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turns</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                         <div className="text-2xl font-bold">
               {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
               {Math.round(speakers.reduce((sum: number, s: any) => sum + s.turns, 0) / speakers.length)}
             </div>
            <p className="text-xs text-muted-foreground">Per speaker</p>
          </CardContent>
        </Card>
      </div>

      {/* Speaker Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Speaker Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of each speaker&apos;s participation
          </CardDescription>
        </CardHeader>
        <CardContent>
                     <div className="space-y-4">
             {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
             {speakers.map((speaker: any, index: number) => (
              <div 
                key={speaker.name} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{speaker.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {speaker.speakingPercentage}% of total speaking time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1} most active
                    </Badge>
                  </div>
                </div>

                {/* Speaking time visualization */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Speaking Time</span>
                    <span className="font-medium">{speaker.formattedTime}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${speaker.speakingPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Turns</span>
                    </div>
                    <div className="font-semibold text-sm">{speaker.turns}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Confidence</span>
                    </div>
                    <div className={`font-semibold text-sm ${getConfidenceColor(speaker.avgConfidence)}`}>
                      {speaker.avgConfidence}%
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <span className="text-xs text-muted-foreground">Sentiment</span>
                    </div>
                    <div className={`font-semibold text-sm ${getSentimentColor(speaker.avgSentiment)}`}>
                      {getSentimentLabel(speaker.avgSentiment)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Avg Turn</span>
                    </div>
                    <div className="font-semibold text-sm">
                      {speaker.turns > 0 ? `${Math.round(speaker.totalTime / speaker.turns)}s` : '0s'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Speaker Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Speaker Insights</CardTitle>
          <CardDescription>Key observations about speaker participation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {speakers.length > 1 && (
              <>
                {speakers[0].speakingPercentage > 70 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>{speakers[0].name}</strong> dominated the conversation with {speakers[0].speakingPercentage}% of speaking time.
                    </span>
                  </div>
                )}

                                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {speakers.filter((s: any) => s.speakingPercentage > 20).length >= 3 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Great discussion balance! Multiple speakers contributed significantly to the conversation.
                    </span>
                  </div>
                )}

                                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {speakers.some((s: any) => s.avgConfidence < 70) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">
                      Some speakers had lower transcription confidence. Consider improving audio quality for better accuracy.
                    </span>
                  </div>
                )}

                                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {speakers.filter((s: any) => s.avgSentiment > 0.2).length > speakers.length / 2 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Positive sentiment from most speakers indicates a successful and engaging webinar.
                    </span>
                  </div>
                )}
              </>
            )}

            {speakers.length === 1 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm">
                  Single speaker presentation. Consider adding Q&A or interactive elements for audience engagement.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 