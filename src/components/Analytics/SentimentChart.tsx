"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sentimentData: any;
  overallSentiment?: number;
}

export const SentimentChart = ({ sentimentData, overallSentiment }: SentimentChartProps) => {
  if (!sentimentData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No sentiment data available for this webinar.</p>
        </CardContent>
      </Card>
    );
  }

  // Process sentiment data
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  const sentimentArray = Array.isArray(sentimentData) ? sentimentData : [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sentimentArray.forEach((item: any) => {
    if (item.sentiment === 'POSITIVE') {
      sentimentCounts.positive++;
    } else if (item.sentiment === 'NEGATIVE') {
      sentimentCounts.negative++;
    } else {
      sentimentCounts.neutral++;
    }
  });

  const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
  
  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (sentiment < -0.2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600';
    if (sentiment < -0.2) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall Sentiment
            {overallSentiment !== undefined && getSentimentIcon(overallSentiment)}
          </CardTitle>
          <CardDescription>
            Average sentiment across the entire webinar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallSentiment !== undefined ? (
              <div className="text-center">
                <div className={`text-4xl font-bold ${getSentimentColor(overallSentiment)}`}>
                  {getSentimentLabel(overallSentiment)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Score: {overallSentiment.toFixed(2)}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No overall sentiment data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Breakdown</CardTitle>
          <CardDescription>
            Distribution of sentiment across all analyzed segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {total > 0 ? (
            <div className="space-y-4">
              {/* Visual bar chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Positive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sentimentCounts.positive}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((sentimentCounts.positive / total) * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(sentimentCounts.positive / total) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sentimentCounts.neutral}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((sentimentCounts.neutral / total) * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${(sentimentCounts.neutral / total) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Negative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sentimentCounts.negative}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((sentimentCounts.negative / total) * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(sentimentCounts.negative / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Summary stats */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((sentimentCounts.positive / total) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Positive Reactions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {total}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Analyzed</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No sentiment breakdown data available</p>
          )}
        </CardContent>
      </Card>

      {/* Key Sentiment Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Notable sentiment patterns from your webinar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {total > 0 ? (
              <>
                {sentimentCounts.positive > sentimentCounts.negative && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Your webinar received mostly positive reactions from attendees
                    </span>
                  </div>
                )}
                
                {sentimentCounts.negative > sentimentCounts.positive && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      Consider reviewing content that may have caused negative reactions
                    </span>
                  </div>
                )}

                {sentimentCounts.neutral > (sentimentCounts.positive + sentimentCounts.negative) / 2 && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">
                      Most reactions were neutral - consider adding more engaging content
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No sentiment insights available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 