import _isUndefined from 'lodash/isUndefined';

import { newActivityId } from '../utils';
import { CommonQuestionItem } from '../../survey/survey-editor/questions/common/types';
import type { ActivitySection } from './activityEditor.slice';
import type {
  Activity,
  ActivityTaskType,
  ActivityResponse,
  ActivityItemValue,
} from 'src/modules/api';

export interface ActivityItem extends CommonQuestionItem {
  value?: ActivityItemValue;
}

export interface ActivityTaskItem {
  studyId: string;
  id: string;
  type: ActivityTaskType;
  title: string;
  description: string;
  iconUrl?: string;
  items: ActivitySection[];
}

type ActivityItemContent = Pick<ActivityItem, 'description' | 'title' | 'value'>;

const predefinedActivityTitles = {
  introduction: 'Introduction',
  preparation: 'Preparation',
  completion: 'Completion',
};

const predefinedActivitySteps: Record<string, ActivityItemContent> = {
  introduction: {
    title: predefinedActivityTitles.introduction,
    description: 'Participants see a brief description of the activity.',
  },
  completion: {
    title: predefinedActivityTitles.completion,
    description: 'Participants see this message upon completion, which you can modify.',
    value: {
      completionTitle: 'Great job!',
      completionDescription: 'Your task was successfully completed.',
    },
  },
};

function newActivityItems(activityTask?: ActivityResponse['task']) {
  let sequence = 0;
  const items: ActivityItem[] = [];

  return {
    addItem({ value, ...restContent }: ActivityItemContent) {
      items.push({
        id: sequence.toString(),
        ...restContent,
        value: value
          ? {
            completionTitle: activityTask?.completionTitle || value?.completionTitle || undefined,
            completionDescription: activityTask?.completionDescription || value?.completionDescription || undefined,
            transcription: activityTask?.properties?.transcription || value?.transcription || undefined,
          }
          : undefined,
      });
      sequence += 1;
      return this;
    },
    items,
  };
}

export const activityItemListFromApi = (activity: ActivityResponse): ActivityItem[] => {
  const { type } = activity.task || {};

  const newActivity = newActivityItems(activity.task).addItem(predefinedActivitySteps.introduction);

  if (type === 'RANGE_OF_MOTION') {
    newActivity
      .addItem({
        title: predefinedActivityTitles.preparation,
        description: 'Participants see a brief description of right arm circumduction.',
      })
      .addItem({
        title: 'Right arm circumduction',
        description:
          'Participants are instructed to straighten and move their right arm in a full circle for 20 seconds.',
      })
      .addItem({
        title: predefinedActivityTitles.preparation,
        description: 'Participants see a brief description of left arm circumduction.',
      })
      .addItem({
        title: 'Left arm circumduction',
        description:
          'Participants are instructed to straighten and move their left arm in a full circle for 20 seconds.',
      })
      .addItem({
        ...predefinedActivitySteps.completion,
        value: {
          ...predefinedActivitySteps.completion.value,
          completionDescription: 'Your left arm circumduction movement score has been recorded.',
        },
      });
  } else {
    if (type === 'TAPPING_SPEED') {
      newActivity
        .addItem({
          title: predefinedActivityTitles.preparation,
          description: 'Participants see a brief description of right hand tapping.',
        })
        .addItem({
          title: 'Right hand tapping',
          description:
            'Participants are instructed to tap the circles with their right hand as quick as possible.',
        })
        .addItem({
          title: predefinedActivityTitles.preparation,
          description: 'Participants see a brief description of left hand tapping.',
        })
        .addItem({
          title: 'Left hand tapping',
          description:
            'Participants are instructed to tap the circles with their left hand as quick as possible.',
        });
    } else if (type === 'GAIT_AND_BALANCE') {
      newActivity
        .addItem({
          title: 'Walk straight',
          description:
            'Participants are instructed to walk in a straight line unassisted for 20 steps.',
        })
        .addItem({
          title: 'Walk back',
          description:
            'Participants are instructed to turn around and walk back to the starting point.',
        })
        .addItem({
          title: 'Stand still',
          description: 'Participants are instructed to stand still for 20 seconds.',
        });
    } else if (type === 'MOBILE_SPIROMETRY') {
      newActivity.addItem({
        title: 'Breathe',
        description: 'Participants are instructed to breathe forcefully 3 times.',
      });
    } else if (type === 'GUIDED_BREATHING') {
      newActivity.addItem({
        title: 'Breathe',
        description:
          'Participants are instructed to sit upright and take 10 deep breaths in and out.',
      });
    } else if (type === 'SUSTAINED_PHONATION') {
      newActivity.addItem({
        title: 'Vocalize',
        description: 'Participants are instructed to inhale then exhale with a loud “ahh”.',
      });
    } else if (type === 'SPEECH_RECOGNITION') {
      newActivity.addItem({
        title: 'Read',
        description:
          'Enter the text that participants are instructed to read as loudly as possible.',
        value: {
          transcription: 'Jaded zombies acted quaintly but kept driving their oxen forward.',
        },
      });
    } else if (type === 'STEP_TEST') {
      newActivity.addItem({
        title: 'Step up and down',
        description: 'Participants are instructed to step up and down on the stairs for 3 minutes.',
      });
    } else if (type === 'WALK_TEST') {
      newActivity.addItem({
        title: 'Walk',
        description:
          'Participants are instructed to walk for 6 minutes while turning around at every one minute and 30 seconds.',
      });
    } else if (type === 'SIT_TO_STAND') {
      newActivity.addItem({
        title: 'Sit and stand',
        description: 'Participants see this message upon completion, which you can modify.',
      });
    } else if (type === 'REACTION_TIME') {
      newActivity.addItem({
        title: 'React',
        description:
          'Participants are instructed to shake their phone immediately when shapes appear on the screen.',
      });
    } else if (type === 'STROOP_TEST') {
      newActivity.addItem({
        title: 'Select colors',
        description:
          'Participants are instructed to select the colors of 30 words as quickly as possible.',
      });
    } else if (type === 'ECG_MEASUREMENT') {

    }

    newActivity.addItem(predefinedActivitySteps.completion);
  }

  return newActivity.items;
};

export const emptySection = (s?: Partial<ActivitySection>): ActivitySection => ({
  id: newActivityId(),
  children: [],
  ...s,
});

export const activityFromApi = (studyId: string, t: ActivityResponse): ActivityTaskItem => {
  return {
    studyId,
    id: t.id || '',
    type: t.task.type,
    title: t.title || '',
    description: t.description || '',
    items: [
      emptySection({
        children: activityItemListFromApi(t),
      }),
    ],
  };
};

type NecessaryActivityProps = 'title' | 'description' | 'task';
export const activityUpdateToApi = (task: ActivityTaskItem): Pick<Activity, NecessaryActivityProps> => {
  const contents = task.items
    .map((s) => s.children)
    .flat()
    .reduce(
      (result, curr) => {
        if (curr.value?.completionTitle !== undefined) {
          result.completionTitle = curr.value.completionTitle;
        }

        if (curr.value?.completionDescription !== undefined) {
          result.completionDescription = curr.value.completionDescription;
        }

        if (curr.value?.transcription !== undefined) {
          result.properties.transcription = curr.value.transcription;
        }

        return result;
      },
      {
        completionTitle: '',
        completionDescription: '',
        required: true,
        type: task.type,
        properties: {
          transcription: undefined,
        },
      } as Activity['task']
    );

  return {
    title: task.title,
    description: task.description,
    task: contents,
  };
};
