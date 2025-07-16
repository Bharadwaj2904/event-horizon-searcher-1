export interface EventLog {
  serialno: number;
  version: number;
  accountId: string;
  instanceId: string;
  srcaddr: string;
  dstaddr: string;
  srcport: number;
  dstport: number;
  protocol: number;
  packets: number;
  bytes: number;
  starttime: number;
  endtime: number;
  action: string;
  logStatus: string;
  fileName?: string;
}

export interface SearchCriteria {
  searchString: string;
  startTime: number | null;
  endTime: number | null;
}

export interface SearchResult {
  events: EventLog[];
  searchTime: number;
  totalMatches: number;
}

export interface ParsedFile {
  fileName: string;
  events: EventLog[];
  parseTime: number;
}