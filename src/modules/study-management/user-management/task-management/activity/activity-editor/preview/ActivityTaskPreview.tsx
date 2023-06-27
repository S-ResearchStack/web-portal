import React, { useMemo, useState } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';

import styled from 'styled-components';

import { setSidebarForceCollapsed } from 'src/modules/main-layout/sidebar/sidebar.slice';
import { useAppDispatch } from 'src/modules/store';
import Button from 'src/common/components/Button';
import Dropdown from 'src/common/components/Dropdown';
import { ActivityTaskType } from 'src/modules/api';
import { colors, px, typography } from 'src/styles';
import { ActivityItemValue } from 'src/modules/api/models/tasks';
import PreviewScreenLayout from 'src/modules/study-management/user-management/common/PreviewScreenLayout';
import { activityTypeToTitle } from '../../activities.utils';
import { getActivityPreviewConfig } from './config';

const DropdownLabel = styled.div`
  ${typography.bodyMediumRegular};
  margin-right: ${px(18)};
  white-space: nowrap;
`;

const DropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: ${px(40)};
  margin-top: ${px(24)};
`;

const Content = styled.div`
  padding: ${px(24)};
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
`;

const NextButton = styled(Button).attrs({
  fill: 'solid',
})`
  height: ${px(44)};
  width: ${px(320)};
  margin: 0 ${px(20)} ${px(54)};
`;

const Warning = styled.div`
  width: ${px(270)};
  margin: 0 ${px(40)} ${px(24)};
  padding: ${px(16)} ${px(24)};
  border-radius: ${px(4)};

  ${typography.bodySmallRegular};
  background: ${colors.primary10};
  color: ${colors.primary};
`;

type Props = {
  type: ActivityTaskType;
  itemValues: ActivityItemValue[];
};

const ActivityTaskPreview = ({ type, itemValues }: Props) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const config = useMemo(
    () =>
      getActivityPreviewConfig(type, {
        itemValues,
      }),
    [type, itemValues]
  );

  const handleNextClick = () => setCurrentStepIdx((currentStepIdx + 1) % config.steps.length);

  const step = config.steps[currentStepIdx];

  const dropdownItems = useMemo(
    () =>
      config.steps.map((_, idx) => ({
        label: `Step ${idx + 1}`,
        key: idx,
      })),
    [config.steps]
  );

  const dispatch = useAppDispatch();

  useLifecycles(
    () => {
      dispatch(setSidebarForceCollapsed(true));
    },
    () => {
      dispatch(setSidebarForceCollapsed(false));
    }
  );

  return (
    <>
      <DropdownWrapper>
        <DropdownLabel>Switch to</DropdownLabel>
        <Dropdown items={dropdownItems} activeKey={currentStepIdx} onChange={setCurrentStepIdx} />
      </DropdownWrapper>
      <PreviewScreenLayout title={activityTypeToTitle(type)}>
        <Content>{step?.content}</Content>
        <NextButton onClick={handleNextClick}>{step?.nextLabel}</NextButton>
      </PreviewScreenLayout>
      <Warning>
        The preview screens are static snapshots. Some of the actual app screens change dynamically.
      </Warning>
    </>
  );
};

export default ActivityTaskPreview;
