type DateString = string;

export enum BaseTaskType { SURVEY = 'SURVEY', ACTIVITY = 'ACTIVITY' };
export enum BaseTaskStatus { CREATED = 'CREATED', PUBLISHED = 'PUBLISHED' };

type TaskInfo = {
  title: string;
  description: string;
  status: BaseTaskStatus;
  iconUrl?: string;
  taskType: BaseTaskType.SURVEY | BaseTaskType.ACTIVITY;
  task: SurveyTask | ActivityTask;
};
export type PublishTaskInfo = {
  schedule: string;
  startTime: DateString;
  endTime?: DateString;
  validMin: number;
  duration: string;
};

type BaseTask = TaskInfo & PublishTaskInfo;

export const ActivityTaskTypeList = [
  'TAPPING_SPEED',
  'GAIT_AND_BALANCE',
  'RANGE_OF_MOTION',
  'SUSTAINED_PHONATION',
  'MOBILE_SPIROMETRY',
  'SPEECH_RECOGNITION',
  'GUIDED_BREATHING',
  'STEP_TEST',
  'WALK_TEST',
  'SIT_TO_STAND',
  'REACTION_TIME',
  'STROOP_TEST',
  'ECG_MEASUREMENT'
] as const;
export type ActivityTaskType = typeof ActivityTaskTypeList[number];
type ActivityTask = {
  type: ActivityTaskType;
  completionTitle: string;
  completionDescription: string;
  required?: boolean;
  properties?: any;
}
export type Activity = BaseTask & {
  taskType: BaseTaskType.ACTIVITY;
  task: ActivityTask;
};
export type ActivityResponse = Activity & {
  id: string,
  createdAt?: string;
  publishedAt?: string;
}
export type ActivityListResponse = ActivityResponse[];

export type ActivityTaskItemGroup = 'FITNESS' | 'AUDIO' | 'COGNITIVE' | 'MOTOR';

type SurveyQuestionType = 'CHOICE' | 'SCALE' | 'TEXT' | 'RANKING' | 'DATETIME';
type SurveyQuestionTag = 'SLIDER' | 'RADIO' | 'CHECKBOX' | 'IMAGE' | 'DROPDOWN' | 'DATETIME' | 'TEXT' | 'RANKING';

export type SurveyTaskSectionQuestion = {
  id: string;
  title: string;
  explanation?: string;
  tag: SurveyQuestionTag;
  type: SurveyQuestionType;
  required: boolean;
  itemProperties?: Record<string, unknown>;
};

export type SurveyTaskSection = {
  questions: SurveyTaskSectionQuestion[]
};

type SurveyTask = {
  sections: SurveyTaskSection[]
}

export type Survey = BaseTask & {
  taskType: BaseTaskType.SURVEY;
  task: SurveyTask;
};

export type SurveyResponse = Survey & {
  id: string,
  createdAt?: string;
  publishedAt?: string;
}

export type SurveyListResponse = SurveyResponse[];

export type ChoiceQuestion = {
  tag: 'RADIO' | 'CHECKBOX' | 'DROPDOWN' | 'IMAGE' | 'MULTIIMAGE';
  options: {
    value: string;
    label?: string;
  }[];
};

export type TextQuestion = {
  tag: 'TEXT';
};

export type ScaleQuestion = {
  tag: 'SLIDER';
  low: number;
  high: number;
  lowLabel?: string;
  highLabel?: string;
};

export type DateTimeLabels = 'Date' | 'Time';
export type DateTimeQuestionConfig = { isDate?: boolean; isTime?: boolean };
export type DateTimeQuestion = DateTimeQuestionConfig & {
  tag: 'DATETIME';
  isRange?: boolean;
};

export type RankQuestion = {
  tag: 'RANK';
  options: {
    value: string;
  }[];
};

export type TaskType = 'survey' | 'activity';

export type ActivityItemValue = {
  completionTitle?: string;
  completionDescription?: string;
  transcription?: string;
};

type TaskResponseCount = {
  count?: number;
};

type CompletionTime = {
  averageInMS?: number;
};

type TaskResult = {
  taskId?: string;
  numberOfRespondedUser?: TaskResponseCount;
  completionTime?: CompletionTime;
};

export type TaskResultsResponse = {
  taskResults?: TaskResult[];
};
