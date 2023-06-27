import React from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import { ActivityItemValue } from 'src/modules/api/models/tasks';
import DoneIcon from 'src/assets/activity-task/preview/done.svg';

type MarginProps = { margin?: number };

const WithMargin = styled.div.attrs<MarginProps>(({ margin }) => ({
  style: {
    marginTop: px(margin || 0),
  },
}))<MarginProps>``;

export const Title = styled(WithMargin)`
  ${typography.sdkDisplayMedium};
  color: ${colors.textPrimary};
  text-align: center;
`;

export const Text = styled(WithMargin)`
  ${typography.sdkBodyMediumRegular};
  color: ${colors.textPrimary};
  text-align: center;
  width: 100%;
  word-break: break-word;
`;

export const Icon = styled(WithMargin)`
  display: flex;
`;

export const List = styled(WithMargin).attrs({
  as: 'ol',
})`
  ${typography.sdkBodyMediumRegular};
  color: ${colors.textPrimary};
  padding-inline-start: ${px(24)};
  margin-bottom: 0;
`;

export const ListItem = styled.li``;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${px(360)};
  padding: 0 ${px(24)};
`;

export type ActivityPreviewParams = {
  itemValues: ActivityItemValue[];
};

type ActivityPreviewStepConfig = {
  content: React.ReactNode;
  nextLabel: string;
};

export type ActivityPreviewConfigData = {
  steps: ActivityPreviewStepConfig[];
};

export type ActivityPreviewConfig =
  | ActivityPreviewConfigData
  | ((params: ActivityPreviewParams) => ActivityPreviewConfigData);

export const commonStep = ({
  icon,
  title,
  list,
  text,
  nextLabel,
}: {
  icon: React.ReactNode;
  title: string;
  list?: string[];
  text?: string;
  nextLabel: string;
}) =>
  ({
    content: (
      <Content>
        <Icon margin={32}>{icon}</Icon>
        <Title margin={54}>{title}</Title>
        {list && (
          <List margin={32}>
            {list.map((item) => (
              <ListItem key={item}>{item}</ListItem>
            ))}
          </List>
        )}
        {text && <Text margin={32}>{text}</Text>}
      </Content>
    ),
    nextLabel,
  } as ActivityPreviewStepConfig);

export const doneStep = ({
  value,
  nextLabel = 'Back to Home',
}: {
  value?: Pick<ActivityItemValue, 'completionDescription' | 'completionTitle'>;
  nextLabel?: string;
}) =>
  commonStep({
    icon: <DoneIcon />,
    title: value?.completionTitle || '',
    text: value?.completionDescription,
    nextLabel,
  });
