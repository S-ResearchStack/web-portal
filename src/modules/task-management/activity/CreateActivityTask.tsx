import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { useAppDispatch } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import Modal, { ModalProps } from 'src/common/components/Modal';
import { ActivityTaskItemGroup, ActivityTaskType } from 'src/modules/api';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useTranslation } from 'src/modules/localization/useTranslation';
import Tabs from 'src/common/components/Tabs';
import { animation, colors, px, typography } from 'src/styles';
import {
  activityDescriptionByType,
  activityTypeNameByType,
  activityTypeToTitle,
  activityTypes,
  getActivityIconByType,
} from './activities.utils';


const Content = styled.div`
  height: ${px(459)};
  padding-top: ${px(35)};
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
  onSelected: () => void;
};

const ActivityCard = ({ type, active, onSelect, onSelected }: ActivityCardProps) => {
  const ActivityIcon = getActivityIconByType(type);

  return (
    <ActivityCardContainer active={active} onClick={onSelect} onDoubleClick={onSelected}>
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
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();
  const { t } = useTranslation();

  const [type, setType] = useState<ActivityTaskType | undefined>();
  const [activeTab, setActiveTab] = useState(DEFAULT_ACTIVE_TAB);

  const resetModal = useCallback(() => {
    setType(undefined);
    setActiveTab(DEFAULT_ACTIVE_TAB);
  }, []);

  const handleCreate = useCallback((type: ActivityTaskType) => {
    studyId && dispatch(push(generatePath(Path.CreateActivity, { activityType: type })))
  }, [studyId, dispatch]);

  const handleAccept = useCallback(() => {
    type && handleCreate(type);
  }, [type]);

  const tabsLabels = useMemo(
    () => activityTypes.map((e) => activityTypeNameByType(e[0] as ActivityTaskItemGroup)),
    []
  );
  const tabContent = useMemo(() => activityTypes[activeTab][1], [activeTab]);

  useEffect(() => {
    setType(undefined);
  }, [activeTab]);

  return (
    <Modal
      {...props}
      title={t("TITLE_CREATE_ACTIVITY")}
      description={t("CAPTION_CREATE_ACTIVITY")}
      size="large"
      acceptLabel="Create"
      declineLabel="Cancel"
      disableAccept={!type}
      onAccept={handleAccept}
      onDecline={onRequestClose}
      onExited={resetModal}
    >
      <Content>
        <Tabs items={tabsLabels} activeItemIdx={activeTab} onTabChange={setActiveTab} />
        <CardGrid>
          {tabContent.map((e) => (
            <ActivityCard key={e} type={e} active={e === type} onSelect={() => setType(e)} onSelected={() => handleCreate(e)} />
          ))}
        </CardGrid>
      </Content>
    </Modal>
  );
};

export default CreateActivityTask;
