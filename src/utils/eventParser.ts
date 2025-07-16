import { EventLog, SearchCriteria, ParsedFile, SearchResult } from '@/types/event';

export class EventParser {
  static parseEventLine(line: string, fileName: string): EventLog | null {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return null;
    }

    const parts = trimmedLine.split(/\s+/);
    if (parts.length < 14) {
      return null;
    }

    try {
      return {
        serialno: parseInt(parts[0]),
        version: parseInt(parts[1]),
        accountId: parts[2],
        instanceId: parts[3],
        srcaddr: parts[4],
        dstaddr: parts[5],
        srcport: parseInt(parts[6]),
        dstport: parseInt(parts[7]),
        protocol: parseInt(parts[8]),
        packets: parseInt(parts[9]),
        bytes: parseInt(parts[10]),
        starttime: parseInt(parts[11]),
        endtime: parseInt(parts[12]),
        action: parts[13],
        logStatus: parts[14] || 'OK',
        fileName
      };
    } catch (error) {
      console.warn(`Failed to parse line: ${line}`, error);
      return null;
    }
  }

  static async parseFile(file: File): Promise<ParsedFile> {
    const startTime = performance.now();
    const text = await file.text();
    const lines = text.split('\n');
    
    const events: EventLog[] = [];
    
    for (const line of lines) {
      const event = this.parseEventLine(line, file.name);
      if (event) {
        events.push(event);
      }
    }

    const parseTime = (performance.now() - startTime) / 1000;
    
    return {
      fileName: file.name,
      events,
      parseTime
    };
  }

  static searchEvents(
    parsedFiles: ParsedFile[],
    criteria: SearchCriteria
  ): SearchResult {
    const startTime = performance.now();
    
    let allEvents: EventLog[] = [];
    for (const file of parsedFiles) {
      allEvents = allEvents.concat(file.events);
    }

    let filteredEvents = allEvents;

    // Apply search string filter
    if (criteria.searchString) {
      const searchTerm = criteria.searchString.toLowerCase();
      
      // Check if it's a field-based query (contains '=')
      if (searchTerm.includes('=')) {
        const [field, value] = searchTerm.split('=', 2);
        const fieldKey = field.trim();
        const fieldValue = value.trim().toLowerCase();
        
        filteredEvents = filteredEvents.filter(event => {
          const eventValue = this.getEventFieldValue(event, fieldKey);
          return eventValue && eventValue.toLowerCase().includes(fieldValue);
        });
      } else {
        // General search across all string fields
        filteredEvents = filteredEvents.filter(event => {
          const searchableText = [
            event.srcaddr,
            event.dstaddr,
            event.instanceId,
            event.accountId,
            event.action,
            event.logStatus,
            event.srcport.toString(),
            event.dstport.toString(),
            event.protocol.toString()
          ].join(' ').toLowerCase();
          
          return searchableText.includes(searchTerm);
        });
      }
    }

    // Apply time range filters
    if (criteria.startTime !== null) {
      filteredEvents = filteredEvents.filter(event => 
        event.starttime >= criteria.startTime!
      );
    }

    if (criteria.endTime !== null) {
      filteredEvents = filteredEvents.filter(event => 
        event.endtime <= criteria.endTime!
      );
    }

    // Sort by start time (most recent first)
    filteredEvents.sort((a, b) => b.starttime - a.starttime);

    const searchTime = (performance.now() - startTime) / 1000;

    return {
      events: filteredEvents,
      searchTime,
      totalMatches: filteredEvents.length
    };
  }

  private static getEventFieldValue(event: EventLog, field: string): string | null {
    const fieldMap: Record<string, keyof EventLog> = {
      'srcaddr': 'srcaddr',
      'dstaddr': 'dstaddr',
      'srcport': 'srcport',
      'dstport': 'dstport',
      'protocol': 'protocol',
      'action': 'action',
      'logstatus': 'logStatus',
      'instanceid': 'instanceId',
      'accountid': 'accountId'
    };

    const mappedField = fieldMap[field.toLowerCase()];
    if (!mappedField) {
      return null;
    }

    const value = event[mappedField];
    return value ? value.toString() : null;
  }
}