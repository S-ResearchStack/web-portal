import { ActivityTaskItemGroup, ActivityTaskType } from 'src/modules/api';
import { useTranslation } from 'src/modules/localization/useTranslation';
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

const { t } = useTranslation();

export const activityTypes = [
  ['MOTOR', ['TAPPING_SPEED', 'GAIT_AND_BALANCE', 'RANGE_OF_MOTION']],
  ['AUDIO', ['SUSTAINED_PHONATION', 'MOBILE_SPIROMETRY', 'SPEECH_RECOGNITION', 'GUIDED_BREATHING']],
  ['COGNITIVE', ['REACTION_TIME', 'STROOP_TEST']],
] as const;

export const activityGroupByType = (type: ActivityTaskType): ActivityTaskItemGroup =>
  activityTypes.find((i) =>
    (i[1] as unknown as ActivityTaskType[]).includes(type)
  )?.[0] as ActivityTaskItemGroup;

export const activityTypeToTitle = (type: ActivityTaskType) =>
  ({
    TAPPING_SPEED: t('TITLE_TAPPING_SPEED'),
    GAIT_AND_BALANCE: t('TITLE_GAIT_AND_BALANCE'),
    RANGE_OF_MOTION: t('TITLE_RANGE_OF_MOTION'),
    SUSTAINED_PHONATION: t('TITLE_SUSTAINED_PHONATION'),
    MOBILE_SPIROMETRY: t('TITLE_MOBILE_SPIROMETRY'),
    SPEECH_RECOGNITION: t('TITLE_SPEECH_RECOGNITION'),
    GUIDED_BREATHING: t('TITLE_GUIDED_BREATHING'),
    STEP_TEST: t('TITLE_STEP_TEST'),
    WALK_TEST: t('TITLE_WALK_TEST'),
    SIT_TO_STAND: t('TITLE_SIT_TO_STAND'),
    REACTION_TIME: t('TITLE_REACTION_TIME'),
    STROOP_TEST: t('TITLE_STROOP_TEST'),
    ECG_MEASUREMENT: t('TITLE_ECG_MEASUREMENT'),
  }[type]);

export const activityTypeNameByType = (type: ActivityTaskItemGroup) =>
  ({
    MOTOR: t('TITLE_MOTOR'),
    AUDIO: t('TITLE_AUDIO'),
    FITNESS: t('TITLE_FITNESS'),
    COGNITIVE: t('TITLE_COGNITIVE'),
  }[type]);

export const activityDescriptionByType = (type: ActivityTaskType) =>
  ({
    TAPPING_SPEED: t('CAPTION_TAPPING_SPEED'),
    GAIT_AND_BALANCE: t('CAPTION_GAIT_AND_BALANCE'),
    RANGE_OF_MOTION: t('CAPTION_RANGE_OF_MOTION'),
    SUSTAINED_PHONATION: t('CAPTION_SUSTAINED_PHONATION'),
    MOBILE_SPIROMETRY: t('CAPTION_MOBILE_SPIROMETRY'),
    SPEECH_RECOGNITION: t('CAPTION_SPEECH_RECOGNITION'),
    GUIDED_BREATHING: t('CAPTION_GUIDED_BREATHING'),
    STEP_TEST: t('CAPTION_STEP_TEST'),
    WALK_TEST: t('CAPTION_WALK_TEST'),
    SIT_TO_STAND: t('CAPTION_SIT_TO_STAND'),
    REACTION_TIME: t('CAPTION_REACTION_TIME'),
    STROOP_TEST: t('CAPTION_STROOP_TEST'),
    ECG_MEASUREMENT: t('CAPTION_ECG_MEASUREMENT'),
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
    ECG_MEASUREMENT: StroopTestIcon,
  }[type]);
