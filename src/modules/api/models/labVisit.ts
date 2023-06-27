import { SQLTimestamp } from 'src/common/utils/datetime';

export type LabVisitItemResponse = {
  id: number;
  userId: string;
  startTime?: SQLTimestamp;
  endTime?: SQLTimestamp;
  checkedInBy?: string;
  notes?: string;
  filesPath?: string;
};

export type LabVisitListResponse = LabVisitItemResponse[];

export type LabVisitSaveItemRequest = Partial<LabVisitItemResponse>;

export type LabVisitParticipantSuggestionItemRequest = {
  limit: number;
};

export type LabVisitParticipantSuggestionItemResponse = { userId?: string };

export type LabVisitParticipantSuggestionResponse = {
  healthDataOverview?: LabVisitParticipantSuggestionItemResponse[];
};
