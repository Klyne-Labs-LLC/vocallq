"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, User } from 'lucide-react';

interface TranscriptViewerProps {
  webinarId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transcript: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TranscriptViewer = ({ webinarId, transcript }: TranscriptViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!transcript || !transcript.segments) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No transcript available for this webinar.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter segments based on search term
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredSegments = transcript.segments.filter((segment: any) =>
    segment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (segment.speaker && segment.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Webinar Transcript</CardTitle>
          <CardDescription>
            {transcript.segments.length} segments • {transcript.audioDuration ? `${Math.round(transcript.audioDuration / 60)} minutes` : 'Duration unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filteredSegments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {searchTerm ? `No results found for "${searchTerm}"` : 'No transcript segments available.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredSegments.map((segment: any, index: number) => (
            <Card key={segment.id || index}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(segment.startTime)}
                    </div>
                    {segment.speaker && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {segment.speaker}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>
                        {Math.round((segment.confidence || 0) * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 