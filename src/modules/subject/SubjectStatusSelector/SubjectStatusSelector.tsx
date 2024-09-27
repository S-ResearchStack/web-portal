import React, { useEffect, useState } from 'react';
import { RowContainer } from 'src/common/styles/layout';
import { SubjectStatus } from 'src/modules/study-data/studyData.enum';
import styled from 'styled-components';
import { SpecColorType } from 'src/styles/theme';
import { colors, typography } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { setSubjectStatus, SubjectInfo } from '../studyManagement.slice';
import Modal from 'src/common/components/Modal';
import { useTranslation } from 'src/modules/localization/useTranslation';

const StatusText = styled.div<{ color: SpecColorType }>`
  ${typography.labelSemibold}
  padding: 2px 4px;
  color: ${(p) => colors[p.color]};
`;

const StatusButton = styled.div<{ color: SpecColorType; backgroundColor?: SpecColorType }>`
  margin-left: 4px;
  margin-right: 4px;
  border: 1px solid ${(p) => colors[p.color]};
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(p) => p.backgroundColor && colors[p.backgroundColor]};
`;

interface SubjectStatusSelectorProp {
  subjectInfo?: SubjectInfo;
}

const SubjectStatusSelector = ({ subjectInfo }: SubjectStatusSelectorProp) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [selectedStatus, setSelectedStatus] = useState(subjectInfo?.status);
  const [desiredStatus, setDesiredStatus] = useState(subjectInfo?.status);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusList = [
    SubjectStatus.PARTICIPATING,
    SubjectStatus.WITHDRAWN,
    SubjectStatus.DROP,
    SubjectStatus.COMPLETED,
  ];

  const buttonColors: SpecColorType[] = [
    'secondaryGreen',
    'secondaryRed',
    'secondaryViolet',
    'secondarySkyblue',
  ];

  const handleSetStatus = (status: SubjectStatus) => {
    if (!subjectInfo || status === selectedStatus || selectedStatus !== SubjectStatus.PARTICIPATING)
      return;
    setDesiredStatus(status);
    setIsModalOpen(true);
  };

  const handleAcceptSetStatus = async () => {
    if (!subjectInfo || !desiredStatus) return;

    const changed = await dispatch(
      setSubjectStatus({
        studyId: subjectInfo.studyId,
        subjectNumber: subjectInfo.subjectNumber,
        status: desiredStatus,
      })
    );

    if (changed) {
      setSelectedStatus(desiredStatus);
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    setSelectedStatus(subjectInfo?.status);
    setDesiredStatus(subjectInfo?.status);
    setIsModalOpen(false);
  }, [subjectInfo]);

  return (
    <>
      <RowContainer style={{ justifyContent: 'center' }}>
        {subjectInfo &&
          statusList.map((status, index) => (
            <RowContainer key={`${subjectInfo.subjectNumber}-${status}`} flex={0}>
              <StatusButton
                color={buttonColors[index]}
                backgroundColor={selectedStatus === status ? buttonColors[index] : 'transparent'}
                onClick={() => handleSetStatus(status)}
              >
                <StatusText
                  color={selectedStatus === status ? 'primaryWhite' : buttonColors[index]}
                >
                  {status}
                </StatusText>
              </StatusButton>
            </RowContainer>
          ))}
      </RowContainer>
      <Modal
        open={isModalOpen}
        title={t('SUBJECT_MANAGEMENT_CHANGE_STATUS', {
          subject: subjectInfo?.subjectNumber,
          status: desiredStatus,
        })}
        acceptLabel="Okay"
        declineLabel="Cancel"
        onAccept={handleAcceptSetStatus}
        onDecline={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SubjectStatusSelector;
