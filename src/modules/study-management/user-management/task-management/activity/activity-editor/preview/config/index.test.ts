import { ActivityTaskType } from 'src/modules/api';

import { getActivityPreviewConfig } from './index';

describe('get activity  preview steps by type', () => {
  const params = {
    itemValues: [
      {
        transcription: '123',
        completionTitle: 'title',
        completionDescription: 'description',
      },
      {
        transcription: '123',
        completionTitle: 'title',
        completionDescription: 'description',
      },
      {
        transcription: '123',
        completionTitle: 'title',
        completionDescription: 'description',
      },
    ],
  };

  it('should get preview steps', async () => {
    (
      [
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
      ] as ActivityTaskType[]
    ).forEach((t) =>
      expect(getActivityPreviewConfig(t, params)).toEqual(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({
              content: expect.any(Object),
              nextLabel: expect.any(String),
            }),
          ]),
        })
      )
    );

    params.itemValues[1].transcription = '';

    expect(getActivityPreviewConfig('SPEECH_RECOGNITION', params)).toEqual(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            content: expect.any(Object),
            nextLabel: expect.any(String),
          }),
        ]),
      })
    );
  });

  it('[NEGATIVE] should get correct preview steps with wrong type', async () => {
    expect(getActivityPreviewConfig('' as ActivityTaskType, params)).toEqual(
      expect.objectContaining({
        steps: expect.arrayContaining([]),
      })
    );
  });
});
