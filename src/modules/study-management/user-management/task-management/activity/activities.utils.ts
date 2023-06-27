import { ActivityTaskItemGroup, ActivityTaskType } from 'src/modules/api';
import TappingIcon from 'src/assets/activity-task/tapping-speed.svg';
import GaitIcon from 'src/assets/activity-task/gait-balance.svg';
import MotionIcon from 'src/assets/activity-task/range-motion.svg';
import PhonationIcon from 'src/assets/activity-task/sustained-phonation.svg';
import SpirometryIcon from 'src/assets/activity-task/mobile-spiro.svg';
import RecognitionIcon from 'src/assets/activity-task/speech-recognition.svg';
import BreathingIcon from 'src/assets/activity-task/guided-breathing.svg';
import StepTestIcon from 'src/assets/activity-task/step-test.svg';
import ReactionIcon from 'src/assets/activity-task/reaction-time.svg';
import StroopTestIcon from 'src/assets/activity-task/word-color.svg';
import WalkTestIcon from 'src/assets/activity-task/6-mwt.svg';
import SitStandIcon from 'src/assets/activity-task/sit-stand.svg';

export const activityTypes = [
  ['MOTOR', ['TAPPING_SPEED', 'GAIT_AND_BALANCE', 'RANGE_OF_MOTION']],
  ['AUDIO', ['SUSTAINED_PHONATION', 'MOBILE_SPIROMETRY', 'SPEECH_RECOGNITION', 'GUIDED_BREATHING']],
  ['FITNESS', ['STEP_TEST', 'WALK_TEST', 'SIT_TO_STAND']],
  ['COGNITIVE', ['REACTION_TIME', 'STROOP_TEST']],
] as const;

export const activityGroupByType = (type: ActivityTaskType): ActivityTaskItemGroup =>
  activityTypes.find((i) =>
    (i[1] as unknown as ActivityTaskType[]).includes(type)
  )?.[0] as ActivityTaskItemGroup;

export const activityTypeToTitle = (type: ActivityTaskType) =>
  ({
    TAPPING_SPEED: 'Tapping Speed',
    GAIT_AND_BALANCE: 'Gait & Balance',
    RANGE_OF_MOTION: 'Range of Motion',
    SUSTAINED_PHONATION: 'Sustained Phonation',
    MOBILE_SPIROMETRY: 'Mobile Spirometry',
    SPEECH_RECOGNITION: 'Speech Recognition',
    GUIDED_BREATHING: 'Guided Breathing',
    STEP_TEST: 'YMCA Step Test',
    WALK_TEST: '6-Minute Walk Test',
    SIT_TO_STAND: 'Sit to Stand',
    REACTION_TIME: 'Reaction Time',
    STROOP_TEST: 'Color Word Challenge',
  }[type]);

export const activityTypeNameByType = (type: ActivityTaskItemGroup) =>
  ({
    FITNESS: 'Fitness',
    AUDIO: 'Audio',
    COGNITIVE: 'Cognition',
    MOTOR: 'Motor',
  }[type]);

export const activityDescriptionByType = (type: ActivityTaskType) =>
  ({
    TAPPING_SPEED: 'This activity collects measurements related to manual dexterity.',
    GAIT_AND_BALANCE: 'This activity collects measurements related to walking and standing.',
    RANGE_OF_MOTION: 'This activity collects measurements related to arm range of motion.',
    SUSTAINED_PHONATION: 'This activity collects measurements related to voice strength.',
    MOBILE_SPIROMETRY:
      'This activity collects measurements related to the forcefulness of exhales.',
    SPEECH_RECOGNITION:
      'This activity collects measurements related to voice strength and clarity.',
    GUIDED_BREATHING: 'This activity collects measurements related to deep breathing.',
    STEP_TEST: 'This activity collects measurements related to stepping up and down.',
    WALK_TEST:
      'This activity collects measurements related to walking and turning for an extended time.',
    SIT_TO_STAND: 'This activity collects measurements related to repeatedly sitting and standing.',
    REACTION_TIME: 'This activity collects measurements related to reaction time.',
    STROOP_TEST:
      'This activity collects measurements related to color identification and reaction time.',
  }[type]);

export const getActivityIconByType = (type: ActivityTaskType) =>
  ({
    TAPPING_SPEED: TappingIcon,
    GAIT_AND_BALANCE: GaitIcon,
    RANGE_OF_MOTION: MotionIcon,
    SUSTAINED_PHONATION: PhonationIcon,
    MOBILE_SPIROMETRY: SpirometryIcon,
    SPEECH_RECOGNITION: RecognitionIcon,
    GUIDED_BREATHING: BreathingIcon,
    STEP_TEST: StepTestIcon,
    WALK_TEST: WalkTestIcon,
    SIT_TO_STAND: SitStandIcon,
    REACTION_TIME: ReactionIcon,
    STROOP_TEST: StroopTestIcon,
  }[type]);
