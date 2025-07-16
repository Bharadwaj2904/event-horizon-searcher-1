import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  uploadedFiles: File[];
  onRemoveFile: (fileName: string) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  uploadedFiles,
  onRemoveFile,
  isProcessing
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesUploaded(acceptedFiles);
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log', '.txt'],
      'application/gzip': ['.gz'],
      'application/x-tar': ['.tar'],
      'application/x-tgz': ['.tgz']
    },
    multiple: true
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Upload Event Data Files</h2>
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5 shadow-glow' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-foreground font-medium mb-2">
              Drop event data files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .log, .txt, .gz, .tar, .tgz files
            </p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-card-foreground mb-3">Uploaded Files:</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(file.name)}
                  disabled={isProcessing}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};