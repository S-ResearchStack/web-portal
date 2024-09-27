import { SQLTimestamp } from 'src/common/utils/datetime';

export type LabVisitItemResponse = {
  id: number;
  subjectNumber: string;
  startTime: SQLTimestamp;
  endTime: SQLTimestamp;
  picId: string;
  note: string;
  filePaths: string[];
  createdBy: string;
  modifiedBy?: string;
};

export type LabVisitListResponse = {
  totalCount: number;
  page: number;
  size: number;
  sortBy: string;
  orderBy: 'asc' | 'desc';
  list: LabVisitItemResponse[];
};

export type LabVisitSaveItemRequest = Partial<LabVisitItemResponse>;

type PaticipantSuggestionResponse = {
  id: string;
  email: string;
};
export type PaticipantSuggestionListResponse = PaticipantSuggestionResponse[];

type ResearcherSuggestionResponse = {
  id: string;
  name: string;
};
export type ResearcherSuggestionListResponse = ResearcherSuggestionResponse[];
