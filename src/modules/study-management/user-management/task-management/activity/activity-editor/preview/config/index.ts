import _isFunction from 'lodash/isFunction';
import { ActivityTaskType } from 'src/modules/api';
import { ActivityPreviewConfig, ActivityPreviewConfigData, ActivityPreviewParams } from './common';
import gaitBalanceConfig from './gaitBalance';
import guidedBreathingConfig from './guidedBreathing';
import rangeOfMotionConfig from './rangeOfMotion';
import sustainedPhonationConfig from './sustainedPhonation';
import speechRecognition from './speechRecognition';
import spirometryConfig from './spirometry';
import tappingSpeedConfig from './tappingSpeed';
import stepTestConfig from './stepTest';
import walkTestConfig from './walkTest';
import sitToStandConfig from './sitToStand';
import reactionTimeConfig from './reactionTime';
import stroopTestConfig from './stroopTest';

const config: {
  [type in ActivityTaskType]: ActivityPreviewConfig;
} = {
  TAPPING_SPEED: tappingSpeedConfig,
  GAIT_AND_BALANCE: gaitBalanceConfig,
  RANGE_OF_MOTION: rangeOfMotionConfig,
  MOBILE_SPIROMETRY: spirometryConfig,
  GUIDED_BREATHING: guidedBreathingConfig,
  SUSTAINED_PHONATION: sustainedPhonationConfig,
  SPEECH_RECOGNITION: speechRecognition,
  STEP_TEST: stepTestConfig,
  WALK_TEST: walkTestConfig,
  SIT_TO_STAND: sitToStandConfig,
  REACTION_TIME: reactionTimeConfig,
  STROOP_TEST: stroopTestConfig,
};

export function getActivityPreviewConfig(
  type: ActivityTaskType,
  params: ActivityPreviewParams
): ActivityPreviewConfigData {
  const c = config[type] || {
    steps: [],
  };

  if (_isFunction(c)) {
    return c(params);
  }
  return c;
}
