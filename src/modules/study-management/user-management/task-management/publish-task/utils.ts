import { TaskType } from 'src/modules/api';

export const titleByType = (type: TaskType, lowercase = false) =>
  ({
    survey: 'Survey',
    activity: 'Activity Task',
  }[type][lowercase ? 'toLowerCase' : 'toString']());
