import { SqlResponse } from './sql';

type SurveyResponseGroup = SqlResponse<{ group: string; count: string }>;

export type SurveyResponsesByAgeResponse = SurveyResponseGroup;
export type SurveyResponsesByGenderResponse = SurveyResponseGroup;

export type EligibilityQualificationsResponse = SqlResponse<{
  group: string;
  value: string;
  totalValue: string;
}>;

export type AvgHeartRateFluctuationsResponse = SqlResponse<{
  name: string;
  dataKey: string;
  value: string;
}>;

export type ParticipantItemId = string;

export interface ParticipantListTotalItemsSqlRow {
  total: string;
}

export interface ParticipantListItemSqlRow {
  user_id: string;
  email: string;
  avg_hr_bpm: string;
  steps: string;
  last_synced: string;
  avg_sleep_mins: string;
}

export type ParticipantListSortDirection = 'asc' | 'desc';

export interface ParticipantListSort {
  column: keyof ParticipantListItemSqlRow;
  direction: ParticipantListSortDirection;
}

export type GetParticipantListRequest = {
  offset: number;
  limit: number;
  sort: ParticipantListSort;
};

export type GetParticipantRequest = {
  id: string;
};

export type GetParticipantHeartRateRequest = {
  startTime: string;
  endTime: string;
};

export type ParticipantHeartRateSqlRow = {
  user_id: string;
  time: string;
  bpm: string;
  age: string;
  gender: string;
  // TODO: right now this is just for mock purposes
  anomaly?: boolean;
};

export type GetAverageParticipantHeartRateRequest = {
  startTime: string;
  endTime: string;
};

export type AverageParticipantHeartRateSqlRow = {
  user_id: string;
  last_synced: string;
  avg_bpm: string;
  age: string;
  gender: string;
};

export type AverageStepCountSqlRow = {
  gender: string;
  day_of_week: string;
  steps: string;
};
