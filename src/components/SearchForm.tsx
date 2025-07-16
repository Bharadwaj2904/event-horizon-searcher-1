import React, { useState } from 'react';
import { Search, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { SearchCriteria } from '@/types/event';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isSearching: boolean;
  hasFiles: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isSearching,
  hasFiles
}) => {
  const [searchString, setSearchString] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const criteria: SearchCriteria = {
      searchString: searchString.trim(),
      startTime: startTime ? parseInt(startTime) : null,
      endTime: endTime ? parseInt(endTime) : null
    };

    onSearch(criteria);
  };

  const isFormValid = searchString.trim().length > 0 && hasFiles;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">Search Events</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="searchString" className="text-sm font-medium">
            Search Query
          </Label>
          <Input
            id="searchString"
            placeholder="Enter IP address (e.g., 159.62.125.136) or field query (e.g., dstaddr=221.181.27.227)"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Search for IP addresses or use field=value format (srcaddr, dstaddr, action, etc.)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Start Time (Epoch)
            </Label>
            <Input
              id="startTime"
              type="number"
              placeholder="1725850449"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              End Time (Epoch)
            </Label>
            <Input
              id="endTime"
              type="number"
              placeholder="1725855086"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || isSearching}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-200"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Filter className="h-4 w-4 mr-2" />
              Search Events
            </>
          )}
        </Button>

        {!hasFiles && (
          <p className="text-sm text-warning text-center">
            Please upload event data files before searching
          </p>
        )}
      </form>
    </Card>
  );
};