import React, { useState, useCallback } from 'react';
import { Search, Activity, AlertCircle } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { SearchForm } from '@/components/SearchForm';
import { SearchResults } from '@/components/SearchResults';
import { FileStats } from '@/components/FileStats';
import { EventParser } from '@/utils/eventParser';
import { ParsedFile, SearchCriteria, SearchResult } from '@/types/event';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  const handleFilesUploaded = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setSearchResults(null);
    
    try {
      const newFiles = files.filter(
        file => !uploadedFiles.some(existing => existing.name === file.name)
      );
      
      if (newFiles.length === 0) {
        toast({
          title: "Files already uploaded",
          description: "These files have already been processed.",
          variant: "default"
        });
        setIsProcessing(false);
        return;
      }

      const newParsedFiles: ParsedFile[] = [];
      
      for (const file of newFiles) {
        try {
          const parsed = await EventParser.parseFile(file);
          newParsedFiles.push(parsed);
          
          toast({
            title: "File processed successfully",
            description: `${file.name}: ${parsed.events.length} events loaded in ${parsed.parseTime.toFixed(2)}s`,
            variant: "default"
          });
        } catch (error) {
          console.error(`Error parsing file ${file.name}:`, error);
          toast({
            title: "File processing error",
            description: `Failed to process ${file.name}. Please check the file format.`,
            variant: "destructive"
          });
        }
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setParsedFiles(prev => [...prev, ...newParsedFiles]);
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the files.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, toast]);

  const handleRemoveFile = useCallback((fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    setParsedFiles(prev => prev.filter(file => file.fileName !== fileName));
    setSearchResults(null);
    
    toast({
      title: "File removed",
      description: `${fileName} has been removed from the search index.`,
      variant: "default"
    });
  }, [toast]);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    if (parsedFiles.length === 0) {
      toast({
        title: "No data available",
        description: "Please upload and process event data files before searching.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const results = EventParser.searchEvents(parsedFiles, criteria);
      setSearchResults(results);
      
      toast({
        title: "Search completed",
        description: `Found ${results.totalMatches} matching events in ${results.searchTime.toFixed(3)} seconds`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [parsedFiles, toast]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Event Log Search</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your event data files and search through them using IP addresses, 
            field-based queries, and time ranges. Process multiple files simultaneously 
            and get instant results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - File Upload & Stats */}
          <div className="lg:col-span-1 space-y-4">
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              uploadedFiles={uploadedFiles}
              onRemoveFile={handleRemoveFile}
              isProcessing={isProcessing}
            />
            <FileStats
              parsedFiles={parsedFiles}
              isProcessing={isProcessing}
            />
          </div>

          {/* Middle Column - Search Form */}
          <div className="lg:col-span-1">
            <SearchForm
              onSearch={handleSearch}
              isSearching={isSearching}
              hasFiles={parsedFiles.length > 0}
            />
          </div>

          {/* Right Column - Search Results */}
          <div className="lg:col-span-2">
            <SearchResults
              results={searchResults}
              isSearching={isSearching}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Search className="h-4 w-4" />
            <span>Event Log Search Application</span>
          </div>
          <p>
            Supports searching by IP addresses, field-based queries (field=value), and time ranges.
            All processing is done locally in your browser for maximum privacy and speed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
