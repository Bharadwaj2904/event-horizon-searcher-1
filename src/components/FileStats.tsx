import React from 'react';
import { FileText, Clock, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ParsedFile } from '@/types/event';

interface FileStatsProps {
  parsedFiles: ParsedFile[];
  isProcessing: boolean;
}

export const FileStats: React.FC<FileStatsProps> = ({
  parsedFiles,
  isProcessing
}) => {
  if (parsedFiles.length === 0 && !isProcessing) {
    return null;
  }

  const totalEvents = parsedFiles.reduce((sum, file) => sum + file.events.length, 0);
  const totalParseTime = parsedFiles.reduce((sum, file) => sum + file.parseTime, 0);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-card-foreground">Data Summary</h3>
      </div>

      {isProcessing ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          <span className="text-sm text-muted-foreground">Processing files...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Events:</span>
            <Badge variant="secondary">{totalEvents.toLocaleString()}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Parse Time:</span>
            <Badge variant="outline">{totalParseTime.toFixed(2)}s</Badge>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Files:</span>
            {parsedFiles.map((file) => (
              <div key={file.fileName} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-32" title={file.fileName}>
                    {file.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {file.events.length.toLocaleString()}
                  </span>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {file.parseTime.toFixed(2)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};