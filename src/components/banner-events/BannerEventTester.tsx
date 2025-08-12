import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, StopCircle } from 'lucide-react';

interface BannerEventTesterProps {
  eventId?: number;
}

export function BannerEventTester({ eventId }: BannerEventTesterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Event Testing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Test banner event functionality and preview results
          </div>
          <div className="flex gap-2">
            <Button size="sm">
              <PlayCircle className="h-4 w-4 mr-2" />
              Test Event
            </Button>
            <Button variant="outline" size="sm">
              <StopCircle className="h-4 w-4 mr-2" />
              Stop Test
            </Button>
          </div>
          <div className="pt-4 border-t">
            <Badge variant="secondary">Testing Module Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
