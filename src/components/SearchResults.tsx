import React from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchResult } from '@/types/event';

interface SearchResultsProps {
  results: SearchResult | null;
  isSearching: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isSearching
}) => {
  if (isSearching) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Searching through event logs...</p>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="p-6 text-center border-dashed">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No search performed yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload files and enter search criteria to begin
        </p>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'ACCEPT':
        return 'bg-success text-success-foreground';
      case 'REJECT':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getProtocolName = (protocol: number) => {
    const protocols: Record<number, string> = {
      1: 'ICMP',
      6: 'TCP',
      17: 'UDP'
    };
    return protocols[protocol] || `Protocol ${protocol}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          <h2 className="text-xl font-semibold text-card-foreground">Search Results</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{results.searchTime.toFixed(3)}s</span>
          </div>
          <Badge variant="secondary">
            {results.totalMatches} match{results.totalMatches !== 1 ? 'es' : ''}
          </Badge>
        </div>
      </div>

      {results.events.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No events found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search criteria or time range
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.events.map((event, index) => (
            <div
              key={`${event.fileName}-${event.serialno}-${index}`}
              className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {event.fileName}
                  </Badge>
                  <Badge className={getActionColor(event.action)}>
                    {event.action}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getProtocolName(event.protocol)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Serial: {event.serialno}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Network Flow</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {event.srcaddr}:{event.srcport}
                    </code>
                    <ArrowRight className="h-3 w-3" />
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {event.dstaddr}:{event.dstport}
                    </code>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-medium text-foreground">Traffic Stats</div>
                  <div className="text-muted-foreground">
                    {event.packets} packets, {(event.bytes / 1024).toFixed(1)} KB
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-medium text-foreground">Time Range</div>
                  <div className="text-muted-foreground text-xs">
                    <div>Start: {formatTimestamp(event.starttime)}</div>
                    <div>End: {formatTimestamp(event.endtime)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Instance: {event.instanceId}</span>
                  <span>Account: {event.accountId}</span>
                  <span>Status: {event.logStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};