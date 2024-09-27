import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import PlusIcon from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import CollapseSection from 'src/common/components/CollapseSection';
import { px } from 'src/styles';

import { useTranslation } from 'src/modules/localization/useTranslation';
import SimpleGrid from 'src/common/components/SimpleGrid';
import EducationList from './EducationList';
import CreateEducation from './CreateEducation';

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

const EducationManagement = () => {
  const { t } = useTranslation();

  const [isCreatePublicationOpen, setCreatePublicationOpen] = useState(false);

  const handleCreatePublication = () => setCreatePublicationOpen(true);
  const handleCloseCreatePublicationModal = useCallback(() => setCreatePublicationOpen(false), []);

  return (
    <SimpleGrid fullScreen>
      <CollapseSection
        data-testid="education-management"
        title="EDUCATIONAL CONTENT MANAGEMENT"
      >
        <CollapseContent>
          <TabsContainer>
            <CreatePublicationButton
              fill="solid"
              data-testid="create-publication-button"
              icon={<PlusIcon />}
              onClick={handleCreatePublication}
            >
              {t("TITLE_CREATE_NEW")}
            </CreatePublicationButton>
          </TabsContainer>
          <EducationList />
        </CollapseContent>
      </CollapseSection>
      <CreateEducation
        open={isCreatePublicationOpen}
        onRequestClose={handleCloseCreatePublicationModal}
      />
    </SimpleGrid>
  );
};

export default React.memo(EducationManagement, () => true);

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row-reverse;
  margin-bottom: ${px(24)};
`;
