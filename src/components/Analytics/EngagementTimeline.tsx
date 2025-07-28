"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { getEngagementTimeline } from '@/action/analytics';
import { toast } from 'sonner';

interface EngagementTimelineProps {
  webinarId: string;
}

export const EngagementTimeline = ({ webinarId }: EngagementTimelineProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const result = await getEngagementTimeline(webinarId);
        if (result.status === 200 && result.data) {
          setTimelineData(result.data);
        } else {
          toast.error(result.message || 'Failed to load engagement timeline');
        }
      } catch (error) {
        console.error('Error fetching engagement timeline:', error);
        toast.error('Failed to load engagement timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [webinarId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (timelineData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No engagement timeline data available for this webinar.</p>
        </CardContent>
      </Card>
    );
  }

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 0.7) return 'bg-green-500';
    if (engagement >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEngagementLabel = (engagement: number) => {
    if (engagement >= 0.7) return 'High';
    if (engagement >= 0.4) return 'Medium';
    return 'Low';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600';
    if (sentiment < -0.2) return 'text-red-600';
    return 'text-gray-600';
  };

  const maxEngagement = Math.max(...timelineData.map(d => d.engagement));
  const avgEngagement = timelineData.reduce((sum, d) => sum + d.engagement, 0) / timelineData.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgEngagement * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {getEngagementLabel(avgEngagement)}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(maxEngagement * 100)}%</div>
            <p className="text-xs text-muted-foreground">Highest point reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline Points</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timelineData.length}</div>
            <p className="text-xs text-muted-foreground">5-minute intervals</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Timeline</CardTitle>
          <CardDescription>
            Engagement patterns throughout your webinar (5-minute intervals)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
              <div className="space-y-6">
                {timelineData.map((point, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className={`
                      relative z-10 w-8 h-8 rounded-full border-4 border-background
                      ${getEngagementColor(point.engagement)}
                      flex items-center justify-center
                    `}>
                      <span className="text-xs font-bold text-white">
                        {Math.round(point.engagement * 100)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{point.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {getEngagementLabel(point.engagement)} Engagement
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {point.speakerCount} speakers
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(point.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>
                            {point.segmentCount} segments
                          </span>
                          <span className={getSentimentColor(point.sentiment)}>
                            Sentiment: {point.sentiment > 0 ? '+' : ''}{point.sentiment.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Engagement bar */}
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getEngagementColor(point.engagement)}`}
                            style={{ width: `${point.engagement * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
          <CardDescription>Key observations from your webinar timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {avgEngagement >= 0.7 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Excellent engagement throughout the webinar! Your audience was highly engaged.
                </span>
              </div>
            )}
            
            {avgEngagement < 0.4 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <Activity className="h-4 w-4 text-red-600" />
                <span className="text-sm">
                  Consider adding more interactive elements to boost audience engagement.
                </span>
              </div>
            )}

            {maxEngagement - Math.min(...timelineData.map(d => d.engagement)) > 0.5 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  High engagement variation detected. Peak moments could be analyzed for successful content patterns.
                </span>
              </div>
            )}

            {timelineData.filter(d => d.speakerCount > 2).length > timelineData.length / 2 && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  Great interactive discussion! Multiple speakers contributed throughout the session.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 