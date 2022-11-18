export type CreateTaskResponse = {
  id: string;
  revisionId: number;
};

type DateString = string;

type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'STOPPED';

type TaskItemType = 'QUESTION' | 'ROW' | 'IMAGE' | 'ACTIVITY';

type TaskItemQuestionType = 'CHOICE' | 'TEXT' | 'SCALE' | 'DATE' | 'TIME' | 'FREQUENCY';

export type ChoiceQuestion = {
  tag: 'RADIO' | 'CHECKBOX' | 'DROPDOWN';
  options: {
    value: string;
    goToAction?: 'next_item' | 'restart_form' | 'submit_form';
    goToItemId?: string;
  }[];
};

type TextQuestion = {
  tag: 'LONG' | 'SHORT';
};

export type ScaleQuestion = {
  tag: 'SLIDER';
  low: number;
  high: number;
  lowLabel?: string;
  highLabel?: string;
};

type DateQuestion = {
  tag: string;
  includeTime?: boolean;
  includeYear?: boolean;
};

type TimeQuestion = {
  tag: string;
  duration: boolean;
};

type FrequencyQuestion = {
  tag: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
};

export type TaskItemQuestion = {
  title: string;
  explanation?: string;
  required: boolean;
  type: TaskItemQuestionType;
  properties:
    | ChoiceQuestion
    | TextQuestion
    | ScaleQuestion
    | DateQuestion
    | TimeQuestion
    | FrequencyQuestion;
};

type TaskItemRow = {
  title: string;
  explanation?: string;
};

export type TaskItem = {
  name: string;
  sequence: number;
  type: TaskItemType;
  contents: TaskItemQuestion | TaskItemRow;
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

export type TaskListResponse = Task[];

type TaskUpdateItem = Omit<TaskItem, 'name'>;

export type TaskUpdate = Omit<Partial<Task>, 'id' | 'revisionId' | 'createdAt' | 'items'> & {
  items: TaskUpdateItem[];
};

export type TaskItemResultsSqlRow = {
  id: string;
  revision_id: string;
  task_id: string;
  user_id: string;
  item_name: string;
  result: string;
  age: string;
  gender: string;
  started_at: string;
  submitted_at: string;
};

export type TaskCompletionTimeSqlRow = {
  avg_completion_time_ms: string;
};

export type TaskRespondedUsersCountSqlRow = {
  task_id: string;
  num_users_responded: string;
};
