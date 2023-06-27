import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import PlusIcon from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import CollapseSection from 'src/common/components/CollapseSection';
import { colors, px } from 'src/styles';
import CreatingLoader from 'src/modules/study-management/user-management/common/CreatingLoader';
import { isInsideTest } from 'src/common/utils/testing';
import EducationImg from 'src/assets/education/education.svg';

import { useCreatePublication } from './createPublication.slice';
import { useEducationListData } from './educationList.slice';
import EducationList from './EducationList';
import CreatePublication from './CreatePublication';

const CreatePublicationButton = styled(Button)`
  width: ${px(164)};
  > div:first-child {
    padding-left: ${px(2)};
    > svg {
      margin-right: ${px(4)};
    }
  }
`;

const CollapseContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ComingSoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: ${px(92)};
  margin-top: ${px(-8)};
`;

const ComingSoonTitle = styled.div`
  font-family: 'Fira Code', monospace;
  font-size: ${px(14)};
  line-height: ${px(18)};
  font-weight: 450;
  color: ${colors.black60};
  margin-top: ${px(24)};
`;

const EducationManagement = () => {
  const isAPIReady = isInsideTest; // TODO delete this variable when api will be ready

  const { isCreating } = useCreatePublication();

  const [isCreatePublicationOpen, setCreatePublicationOpen] = useState(false);

  const { data, isLoading } = useEducationListData({
    fetchArgs: false,
  });

  const handleCreatePublication = () => setCreatePublicationOpen(true);

  const handleCloseCreatePublicationModal = useCallback(() => setCreatePublicationOpen(false), []);

  const isEmpty = !isLoading && !data?.drafts.length && !data?.published.length;

  return (
    <>
      <CreatingLoader open={isCreating} label="Creating publication..." />
      <CollapseSection
        data-testid="education-management"
        defaultCollapsed={isEmpty && isAPIReady}
        title="EDUCATIONAL CONTENT MANAGEMENT"
        headerExtra={
          <CreatePublicationButton
            onClick={handleCreatePublication}
            icon={<PlusIcon />}
            disabled={!isAPIReady}
            fill="solid"
            data-testid="create-publication-button"
          >
            Create new
          </CreatePublicationButton>
        }
      >
        <CollapseContent>
          {isAPIReady ? (
            <EducationList />
          ) : (
            <ComingSoonContainer>
              <EducationImg />
              <ComingSoonTitle>Coming soon</ComingSoonTitle>
            </ComingSoonContainer>
          )}
        </CollapseContent>
      </CollapseSection>
      <CreatePublication
        open={isCreatePublicationOpen}
        onRequestClose={handleCloseCreatePublicationModal}
      />
    </>
  );
};

export default React.memo(EducationManagement, () => true);
