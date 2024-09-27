import React, { useCallback, useEffect, useState } from 'react';

import styled, { css } from 'styled-components';

import Modal, { ModalProps } from 'src/common/components/Modal';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { animation, colors, px, typography } from 'src/styles';
import { useCreateEducation } from './createEducation.slice';
import { getPublicationIconByType } from './education.utils';
import { EducationalContentType } from 'src/modules/api';

const CreatePublicationModal = styled(Modal)`
  max-width: ${px(516)};
  padding: ${px(40)};
`;

const ModalTitle = styled.div`
  > div {
    margin-top: ${px(12)};
    ${typography.bodyMediumRegular};
  }
`;

const Container = styled.div`
  height: ${px(360)};
  width: ${px(436)};
  display: flex;
  flex-direction: column;
  margin-top: ${px(16)};
  row-gap: ${px(24)};
`;

const TabContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: flex-start;
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

const TabPicture = styled.div`
  width: ${px(72)};
  height: ${px(72)};
  background-color: ${colors.primaryLight};
  border-radius: ${px(2)};
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: ${px(48)};
    height: ${px(48)};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(4)};
`;

const Title = styled.div`
  ${typography.headingSmall};
`;

const Description = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
`;

type TabContent = {
  sourceType: EducationalContentType;
  title: string;
  description: string;
};

const modalTabsContent: Array<TabContent> = [
  {
    sourceType: EducationalContentType.SCRATCH,
    title: 'Create from scratch',
    description: 'Use our form to create your content.',
  },
  {
    sourceType: EducationalContentType.PDF,
    title: 'Use existing PDF',
    description: 'Upload a PDF from your computer.',
  },
  {
    sourceType: EducationalContentType.VIDEO,
    title: 'Use existing video',
    description: 'Upload a video from your computer.',
  },
];

type PublicationTabProps = {
  type: EducationalContentType;
  active: boolean;
  title: string;
  description: string;
  onSelect: () => void;
  onSelected: () => void;
};

const PublicationTab = ({ type, active, onSelect, onSelected, title, description }: PublicationTabProps) => {
  const Icon = () => getPublicationIconByType(type);

  return (
    <TabContainer active={active} onClick={onSelect} onDoubleClick={onSelected} data-testid={type}>
      <TabPicture>
        <Icon />
      </TabPicture>
      <Content>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Content>
    </TabContainer>
  );
};

type CreateActivityTaskProps = {
  onRequestClose: () => void;
} & Omit<ModalProps, 'size' | 'title' | 'acceptLabel' | 'declineLabel' | 'onAccept' | 'onDecline'>;

const CreateEducation = ({ onRequestClose, ...props }: CreateActivityTaskProps) => {
  const studyId = useSelectedStudyId();
  const { create } = useCreateEducation();

  const [type, setType] = useState<EducationalContentType | undefined>();

  const resetModal = useCallback(() => {
    setType(undefined);
  }, []);

  const handleCreate = useCallback((type: EducationalContentType) => {
    studyId && create({ source: type });
  }, [studyId, create]);

  const handleAccept = useCallback(() => {
    type && handleCreate(type);
  }, [type]);

  useEffect(() => {
    setType(undefined);
  }, []);

  const PublicationModalTitle = (
    <ModalTitle>
      Create Publication
      <div>Select content type</div>
    </ModalTitle>
  );

  return (
    <CreatePublicationModal
      {...props}
      title={PublicationModalTitle}
      acceptLabel="Continue"
      disableAccept={!type}
      declineLabel="Cancel"
      onAccept={handleAccept}
      onDecline={onRequestClose}
      onExited={resetModal}
    >
      <Container data-testid="create-publication">
        {modalTabsContent.map(({ sourceType, title, description }) => (
          <PublicationTab
            key={sourceType}
            type={sourceType}
            active={sourceType === type}
            onSelect={() => setType(sourceType)}
            onSelected={() => handleCreate(sourceType)}
            title={title}
            description={description}
          />
        ))}
      </Container>
    </CreatePublicationModal>
  );
};

export default CreateEducation;
