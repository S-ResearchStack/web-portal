import React from 'react';

import styled from 'styled-components';

import SpeechRecognitionStartIcon from 'src/assets/activity-task/preview/speech_recognition_start.svg';
import SpeechRecognitionAudioIcon from 'src/assets/activity-task/preview/speech_recognition_audio.svg';
import SpeechRecognitionAudioEmptyIcon from 'src/assets/activity-task/preview/speech_recognition_audio_empty.svg';
import { colors, px, typography } from 'src/styles';
import { ActivityPreviewConfig, commonStep, Content, doneStep, Icon, Title } from './common';

const TextBox = styled.div`
  margin: ${px(34)} 0 ${px(43)};
  width: ${px(312)};
  height: ${px(152)};
  border-radius: ${px(4)};
  border: ${px(1)} solid ${colors.primary};
  padding: ${px(8)};

  ${typography.sdkBodySmallRegular};
  color: ${colors.textPrimary};
`;

const TextBoxDisabled = styled(TextBox)`
  border-color: rgba(68, 117, 227, 0.1);
`;

const startStep = commonStep({
  icon: <SpeechRecognitionStartIcon />,
  title: 'Speech Recognition',
  list: [
    'Find yourself in a quiet environment without background noise.',
    'Hold phone 6 inches from mouth.',
    'Read the displayed transcription as loudly as possible.',
  ],
  nextLabel: 'Begin',
});

const transcriptionStep = (transcription: string) => ({
  content: (
    <Content>
      <Title margin={24}>{transcription}</Title>
      <TextBox>{transcription}</TextBox>
      <SpeechRecognitionAudioIcon />
    </Content>
  ),
  nextLabel: 'Stop Recording',
});

const noTranscriptionStep = {
  content: (
    <Content>
      <Title margin={24} style={{ color: 'rgba(0, 0, 0, 0.38)' }}>
        Please enter your transcription for participants to read
      </Title>
      <TextBoxDisabled />
      <Icon margin={106}>
        <SpeechRecognitionAudioEmptyIcon />
      </Icon>
    </Content>
  ),
  nextLabel: 'Start Recording',
};

export default (({ itemValues }) => {
  const [, transcription, completion] = itemValues;

  if (!transcription.transcription) {
    return { steps: [startStep, noTranscriptionStep] };
  }

  return {
    steps: [
      startStep,
      transcriptionStep(transcription.transcription),
      doneStep({ value: completion }),
    ],
  };
}) as ActivityPreviewConfig;
