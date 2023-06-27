import { ProfileAttribute } from './overview';

export type CreateTaskResponse = {
  id: string;
  revisionId: number;
};

type DateString = string;

type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'STOPPED';

export type TaskItemType = 'QUESTION' | 'ROW' | 'IMAGE' | 'SECTION' | 'ACTIVITY';

export type ActivityTaskItemGroup = 'FITNESS' | 'AUDIO' | 'COGNITIVE' | 'MOTOR';

type TaskItemQuestionType = 'CHOICE' | 'TEXT' | 'SCALE' | 'DATETIME' | 'FREQUENCY' | 'RANK';

export type ChoiceQuestionSkipLogic = {
  condition: string;
  goToAction?: 'next_item' | 'restart_form' | 'submit_form';
  goToItemSequence: number;
};

export type ChoiceQuestion = {
  tag: 'RADIO' | 'CHECKBOX' | 'DROPDOWN' | 'IMAGE' | 'MULTIIMAGE';
  options: {
    value: string;
    label?: string;
  }[];
  skip_logic?: ChoiceQuestionSkipLogic[];
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

type FrequencyQuestion = {
  tag: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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

type TaskItemQuestionProperties =
  | ChoiceQuestion
  | TextQuestion
  | ScaleQuestion
  | DateTimeQuestion
  | FrequencyQuestion
  | RankQuestion;

export type TaskItemQuestion = {
  title: string;
  explanation?: string;
  required: boolean;
  type: TaskItemQuestionType;
  properties: TaskItemQuestionProperties;
};

export type TaskItemActivity = {
  title: string;
  explanation?: string;
  type: ActivityTaskItemGroup;
};

export type TaskItemSection = {
  title: string;
};

export type TaskItemRow = {
  title: string;
  explanation?: string;
  // TODO: compare next to API
  sectionId?: string;
  value?: {
    title: string;
    description: string;
  };
};

export type TaskType = 'survey' | 'activity';

export type ActivityTaskType =
  | 'TAPPING_SPEED'
  | 'GAIT_AND_BALANCE'
  | 'RANGE_OF_MOTION'
  | 'SUSTAINED_PHONATION'
  | 'MOBILE_SPIROMETRY'
  | 'SPEECH_RECOGNITION'
  | 'GUIDED_BREATHING'
  | 'STEP_TEST'
  | 'WALK_TEST'
  | 'SIT_TO_STAND'
  | 'REACTION_TIME'
  | 'STROOP_TEST';

export type ActivityItemValue = {
  completionTitle?: string;
  completionDescription?: string;
  transcription?: string;
};

export type ActivityTaskContentItem = Pick<TaskItem, 'name' | 'type' | 'sequence'> & {
  type: 'ACTIVITY';
  contents: {
    completionTitle?: string;
    completionDescription?: string;
    type: ActivityTaskType;
    required: boolean;
    properties: {
      transcription?: string;
    };
  };
};

export type TaskItem = {
  name: string;
  sequence: number;
  type: TaskItemType;
  contents: TaskItemQuestion | TaskItemRow | TaskItemSection;
};

export type Task = {
  id: string;
  revisionId: number;
  title?: string;
  description?: string;
  createdAt: string;
  publishedAt?: string | null;
  condition?: unknown; // TODO: define proper type if required
  schedule: string;
  startTime: DateString;
  endTime?: DateString;
  validTime: number;
  status: TaskStatus;
  items: TaskItem[];
};

export type ActivityTask = {
  type: 'ACTIVITY';
  id: string;
  revisionId: number;
  title: string;
  description?: string;
  createdAt: string;
  publishedAt?: string | null;
  startTime: DateString;
  endTime?: DateString;
  validTime: number;
  status: TaskStatus;
  items: ActivityTaskContentItem[];
};

export type TaskListResponse = Task[];

export type ActivityListResponse = ActivityTask[];

type TaskUpdateItem = Omit<TaskItem, 'name'>;

type UnnecessaryTaskProps = 'id' | 'revisionId' | 'createdAt' | 'items';

export type TaskUpdate = Omit<Partial<Task>, UnnecessaryTaskProps> & {
  items?: TaskUpdateItem[];
};

export type ActivityTaskUpdate = Omit<TaskUpdate, 'items'> & {
  type: 'ACTIVITY';
  items?: ActivityTaskContentItem[];
};

type TaskResponseCount = {
  count?: number;
};

type CompletionTime = {
  averageInMS?: number;
};

export type TaskResult = {
  taskId?: string;
  numberOfRespondedUser?: TaskResponseCount;
  completionTime?: CompletionTime;
};

export type TaskItemResponse = {
  itemName?: string;
  userId?: string;
  result?: string;
  profiles?: ProfileAttribute[];
};

export type TaskResultsResponse = {
  taskResults?: TaskResult[];
};

export type SurveyResponseResponse = {
  surveyResponse?: TaskItemResponse[];
};

export type TaskItemResponseFormattedValue = {
  label: string;
  url: string;
  fileSize: number;
};

export type TaskItemResponseValue = Record<string, TaskItemResponseFormattedValue>;

export type ActivityTaskItemResponse = {
  userId?: string;
  result: TaskItemResponseValue;
  profiles?: ProfileAttribute[];
};

export type ActivityTaskItemResponseColumn = {
  key: string;
  label: string;
};

export type ActivityTaskResponse = {
  columns: ActivityTaskItemResponseColumn[];
  responses: ActivityTaskItemResponse[];
};

export type ActivityResponseResponse = {
  surveyResponse: TaskItemResponse[];
};
