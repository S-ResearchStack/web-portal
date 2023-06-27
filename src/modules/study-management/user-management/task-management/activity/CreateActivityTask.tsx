import React, { useCallback, useEffect, useMemo, useState } from 'react';

import styled, { css } from 'styled-components';

import Modal, { ModalProps } from 'src/common/components/Modal';
import { ActivityTaskItemGroup, ActivityTaskType } from 'src/modules/api';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import Tabs from 'src/common/components/Tabs';
import { animation, colors, px, typography } from 'src/styles';
import CreatingLoader from 'src/modules/study-management/user-management/common/CreatingLoader';
import {
  activityDescriptionByType,
  activityTypeNameByType,
  activityTypes,
  activityTypeToTitle,
  getActivityIconByType,
} from './activities.utils';
import { useCreateActivityTask } from './createActivityTask.slice';

const Content = styled.div`
  height: ${px(459)};
  padding-top: ${px(35)};
`;

const Placeholder = styled.div`
  width: 100%;
  height: ${px(420)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.black60};
  font-family: 'Fira Code';
  font-size: ${px(14)};
  line-height: ${px(18)};
  font-weight: 450;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${px(24)};
  margin-top: ${px(23)};
`;

const ActivityCardContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  column-gap: ${px(16)};
  box-shadow: 0 0 ${px(2)} ${colors.black15};
  border-radius: ${px(4)};
  padding: ${px(16)};
  box-sizing: border-box;
  transition: all 300ms ${animation.defaultTiming};
  border: ${px(1)} solid ${(p) => (p.active ? colors.primary : 'transparent')};
  cursor: pointer;
  height: ${px(104)};

  ${(p) =>
    !p.active &&
    css`
      &:hover {
        box-shadow: 0 ${px(2)} ${px(4)} rgba(71, 71, 71, 0.25);
      }
    `}
`;

const ActivityCardPicture = styled.div`
  width: ${px(72)};
  height: ${px(72)};

  svg {
    width: ${px(72)};
    height: ${px(72)};
  }
`;

const ActivityCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(4)};
`;

const ActivityCardTitle = styled.div`
  ${typography.headingSmall};
`;

const ActivityCardDescription = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
`;

type ActivityCardProps = {
  type: ActivityTaskType;
  active: boolean;
  onSelect: () => void;
};

const ActivityCard = ({ type, active, onSelect }: ActivityCardProps) => {
  const ActivityIcon = getActivityIconByType(type);

  return (
    <ActivityCardContainer active={active} onClick={onSelect}>
      <ActivityCardPicture>
        <ActivityIcon />
      </ActivityCardPicture>
      <ActivityCardContent>
        <ActivityCardTitle>{activityTypeToTitle(type)}</ActivityCardTitle>
        <ActivityCardDescription>{activityDescriptionByType(type)}</ActivityCardDescription>
      </ActivityCardContent>
    </ActivityCardContainer>
  );
};

type CreateActivityTaskProps = {
  onRequestClose: () => void;
} & Omit<ModalProps, 'size' | 'title' | 'acceptLabel' | 'declineLabel' | 'onAccept' | 'onDecline'>;

const DEFAULT_ACTIVE_TAB = 0;

const CreateActivityTask = ({ onRequestClose, ...props }: CreateActivityTaskProps) => {
  const studyId = useSelectedStudyId();
  const { isSending, create } = useCreateActivityTask();

  const [type, setType] = useState<ActivityTaskType | undefined>();
  const [activeTab, setActiveTab] = useState(DEFAULT_ACTIVE_TAB);

  const resetModal = useCallback(() => {
    setType(undefined);
    setActiveTab(DEFAULT_ACTIVE_TAB);
  }, []);

  const handleAccept = useCallback(() => {
    studyId && type && create({ studyId, type });
  }, [studyId, type, create]);

  const tabsLabels = useMemo(
    () => activityTypes.map((t) => activityTypeNameByType(t[0] as ActivityTaskItemGroup)),
    []
  );
  const tabContent = useMemo(() => activityTypes[activeTab][1], [activeTab]);

  useEffect(() => {
    setType(undefined);
  }, [activeTab]);

  return (
    <>
      <Modal
        {...props}
        title="Create Activity"
        description="Select an activity template to start with."
        size="large"
        acceptLabel="Create"
        disableAccept={!type}
        declineLabel="Cancel"
        onAccept={handleAccept}
        onDecline={onRequestClose}
        onExited={resetModal}
      >
        <Content>
          <Tabs items={tabsLabels} activeItemIdx={activeTab} onTabChange={setActiveTab} />
          {activeTab === 2 ? (
            <Placeholder>Coming soon</Placeholder>
          ) : (
            <CardGrid>
              {tabContent.map((t) => (
                <ActivityCard key={t} type={t} active={t === type} onSelect={() => setType(t)} />
              ))}
            </CardGrid>
          )}
        </Content>
      </Modal>
      <CreatingLoader open={isSending} label="Creating activity..." />
    </>
  );
};

export default CreateActivityTask;
