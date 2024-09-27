import React, { ChangeEvent, useCallback } from 'react';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';

import styled from 'styled-components';

import {
  InputFieldProps,
  InputFieldShell,
  StyledTextField,
} from 'src/common/components/InputField';
import LimitsCounter from 'src/modules/common/LimitsCounter';
import { colors, px, typography } from 'src/styles';
import { ActivityItemErrors } from './activityEditor.slice';
import { ActivityItem } from './activityConversion';

export const ACTIVITY_CARD_HEIGHT = 113;
export const ACTIVITY_CARD_LOADER_TITLE_WIDTH = 72;

const Container = styled.div`
  min-height: ${px(ACTIVITY_CARD_HEIGHT)};
  min-width: 100%;
  padding: ${px(24)};
  display: flex;
  flex-direction: column;
  gap: ${px(24)};
`;

const Content = styled.div``;

const Counter = styled.div`
  ${typography.labelRegular};
  color: ${colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const Title = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimary};
  margin-bottom: ${px(8)};
`;

const Description = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
`;

const Editor = styled.div``;

const ActivityTextField = withLocalDebouncedState<HTMLInputElement, InputFieldProps>(
  styled(StyledTextField)``
);

type ActivityCardProps = {
  item: ActivityItem;
  index: number;
  errors?: ActivityItemErrors;
  onChange: (data: ActivityItem) => void;
};

const MAX_TITLE_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 70;
const MAX_TRANSCRIPTION_LENGTH = 70;

const ActivityCard = ({ item, index, errors, onChange }: ActivityCardProps) => {
  const handleTitleChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      item.value &&
        onChange({
          ...item,
          value: { ...item.value, completionTitle: evt.target.value },
        });
    },
    [item, onChange]
  );

  const handleDescriptionChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      item.value &&
        onChange({
          ...item,
          value: { ...item.value, completionDescription: evt.target.value },
        });
    },
    [item, onChange]
  );

  const handleTranscriptionChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      item.value &&
        onChange({
          ...item,
          value: { ...item.value, transcription: evt.target.value },
        });
    },
    [item, onChange]
  );

  return (
    <Container data-id={item.id}>
      <Content>
        <Counter>Step {index + 1}</Counter>
        <Title>{item.title}</Title>
        <Description>{item.description}</Description>
      </Content>
      {!!item.value && !!Object.values(item.value || {}).length && (
        <Editor>
          {item.value.completionTitle !== undefined && (
            <InputFieldShell label="Title" error={errors?.value?.completionTitle.empty}>
              <LimitsCounter
                current={item.value.completionTitle?.length || 0}
                max={MAX_TITLE_LENGTH}
              >
                <ActivityTextField
                  value={item.value.completionTitle}
                  onChange={handleTitleChange}
                  error={errors?.value?.completionTitle.empty}
                  placeholder="Enter title*"
                  max={MAX_TITLE_LENGTH}
                />
              </LimitsCounter>
            </InputFieldShell>
          )}
          {item.value.completionDescription !== undefined && (
            <InputFieldShell label="Description" withoutErrorText error={errors?.value?.completionDescription.empty}>
              <LimitsCounter
                current={item.value.completionDescription?.length || 0}
                max={MAX_DESCRIPTION_LENGTH}
              >
                <ActivityTextField
                  value={item.value.completionDescription}
                  error={errors?.value?.completionDescription.empty}
                  onChange={handleDescriptionChange}
                  placeholder="Enter description*"
                  max={MAX_DESCRIPTION_LENGTH}
                />
              </LimitsCounter>
            </InputFieldShell>
          )}
          {item.value.transcription !== undefined && (
            <InputFieldShell
              label="Transcription"
              error={errors?.value?.transcription.empty}
              withoutErrorText
            >
              <LimitsCounter
                current={item.value.transcription?.length || 0}
                max={MAX_TRANSCRIPTION_LENGTH}
              >
                <ActivityTextField
                  value={item.value.transcription}
                  onChange={handleTranscriptionChange}
                  placeholder="Enter transcription"
                  max={MAX_TRANSCRIPTION_LENGTH}
                />
              </LimitsCounter>
            </InputFieldShell>
          )}
        </Editor>
      )}
    </Container>
  );
};

export default ActivityCard;
