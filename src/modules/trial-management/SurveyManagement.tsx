import React, { useCallback } from 'react';

import styled from 'styled-components';

import PlusIcon from 'src/assets/icons/plus.svg';
import Spinner from 'src/common/components/Spinner';
import BackdropOverlay from 'src/common/components/BackdropOverlay';
import Button from 'src/common/components/Button';
import CollapseSection from 'src/common/components/CollapseSection';
import { colors, px, typography } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { createSurvey, useSurveyEditor } from './survey-editor/surveyEditor.slice';
import SurveyList from './SurveyList';

const LoadingContent = styled.div`
  ${typography.headingLargeSemibold};
  color: ${colors.textPrimary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: ${px(182)};
`;

const CreateSurveyButton = styled(Button)`
  > div:first-child {
    padding-left: ${px(2)};
    > svg {
      margin-right: ${px(4)};
    }
  }
`;

const SurveyManagement = () => {
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();
  const { isCreating } = useSurveyEditor();

  const handleCreateSurveyClick = useCallback(() => {
    studyId && dispatch(createSurvey({ studyId }));
  }, [studyId, dispatch]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isCreating && (
        <BackdropOverlay open loaderBackdrop>
          <LoadingContent>
            <Spinner size="m" />
            Creating survey...
          </LoadingContent>
        </BackdropOverlay>
      )}
      <CollapseSection
        title="Survey Management"
        headerExtra={
          <CreateSurveyButton
            icon={<PlusIcon />}
            fill="solid"
            onClick={handleCreateSurveyClick}
            width={164}
          >
            Create survey
          </CreateSurveyButton>
        }
      >
        <SurveyList />
      </CollapseSection>
    </>
  );
};

export default React.memo(SurveyManagement, () => true);
