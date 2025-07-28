"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Users, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { TranscriptViewer } from './TranscriptViewer';
import { SentimentChart } from './SentimentChart';
import { EngagementTimeline } from './EngagementTimeline';
import { SpeakerBreakdown } from './SpeakerBreakdown';
import { getWebinarAnalytics, getTranscriptForDownload } from '@/action/analytics';
import { toast } from 'sonner';

interface WebinarAnalyticsProps {
  webinarId: string;
}

export const WebinarAnalytics = ({ webinarId }: WebinarAnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await getWebinarAnalytics(webinarId);
        if (result.status === 200) {
          setAnalyticsData(result.data);
        } else {
          toast.error(result.message || 'Failed to load analytics');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [webinarId]);

  const handleDownloadTranscript = async () => {
    try {
      setDownloadLoading(true);
      const result = await getTranscriptForDownload(webinarId);
      
      if (result.status === 200) {
        // Create downloadable transcript file
        const transcriptContent = formatTranscriptForDownload(result.data!);
        const blob = new Blob([transcriptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.data!.webinar.title.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Transcript downloaded successfully');
      } else {
        toast.error(result.message || 'Failed to download transcript');
      }
    } catch (error) {
      console.error('Error downloading transcript:', error);
      toast.error('Failed to download transcript');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No analytics data available for this webinar.</p>
        </CardContent>
      </Card>
    );
  }

  const { webinar, transcript, insights, liveTranscriptions, attendanceData } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceData?.filter((a: any) => a.attendedType === 'ATTENDED').length || 0} attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transcript?.audioDuration ? `${Math.round(transcript.audioDuration / 60)}m` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Audio duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.questionCount || 0}</div>
            <p className="text-xs text-muted-foreground">During the webinar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.engagementScore ? `${Math.round(insights.engagementScore * 100)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge 
                variant={
                  !insights?.overallSentiment ? "secondary" :
                  insights.overallSentiment > 0.2 ? "default" : 
                  insights.overallSentiment < -0.2 ? "destructive" : "secondary"
                }
                className="text-xs"
              >
                {!insights?.overallSentiment ? "No data" :
                 insights.overallSentiment > 0.2 ? "Positive" : 
                 insights.overallSentiment < -0.2 ? "Negative" : "Neutral"} sentiment
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main analytics tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>
          
          {transcript && (
            <Button 
              onClick={handleDownloadTranscript}
              disabled={downloadLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {downloadLoading ? 'Downloading...' : 'Download Transcript'}
            </Button>
          )}
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important highlights from your webinar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights?.keyMoments && insights.keyMoments.length > 0 ? (
                  insights.keyMoments.map((moment: any, index: number) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {moment.timestamp || 'N/A'}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {moment.type || 'highlight'}
                        </span>
                      </div>
                      <p className="text-sm">{moment.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No key moments detected yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Top Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>Most mentioned topics and phrases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {insights?.topKeywords && insights.topKeywords.length > 0 ? (
                    insights.topKeywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No keywords extracted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <TranscriptViewer webinarId={webinarId} transcript={transcript} />
        </TabsContent>

        <TabsContent value="speakers">
          <SpeakerBreakdown webinarId={webinarId} />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementTimeline webinarId={webinarId} />
        </TabsContent>

        <TabsContent value="sentiment">
          <SentimentChart 
            sentimentData={transcript?.sentimentResults} 
            overallSentiment={insights?.overallSentiment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to format transcript for download
const formatTranscriptForDownload = (data: any): string => {
  const { webinar, transcript } = data;
  let content = '';
  
  // Header
  content += `WEBINAR TRANSCRIPT\n`;
  content += `==================\n\n`;
  content += `Title: ${webinar.title}\n`;
  content += `Presenter: ${webinar.presenter}\n`;
  content += `Date: ${new Date(webinar.date).toLocaleDateString()}\n`;
  content += `Duration: ${webinar.duration ? `${Math.round(webinar.duration / 60)} minutes` : 'N/A'}\n`;
  content += `Confidence: ${transcript.confidence}%\n\n`;
  
  // Transcript segments
  content += `TRANSCRIPT\n`;
  content += `==========\n\n`;
  
  if (transcript.segments && transcript.segments.length > 0) {
    transcript.segments.forEach((segment: any) => {
      content += `[${segment.timestamp}] ${segment.speaker}: ${segment.text}\n\n`;
    });
  } else {
    content += transcript.fullText || 'No transcript available.';
  }
  
  // Insights
  if (data.insights) {
    content += `\n\nKEY HIGHLIGHTS\n`;
    content += `==============\n\n`;
    
    if (data.insights.highlights && data.insights.highlights.length > 0) {
      data.insights.highlights.forEach((highlight: any, index: number) => {
        content += `${index + 1}. ${highlight.text || highlight}\n`;
      });
    }
  }
  
  content += `\n\n--- Generated by VocallQ Analytics ---`;
  
  return content;
}; 