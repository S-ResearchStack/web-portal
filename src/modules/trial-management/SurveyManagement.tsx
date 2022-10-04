import React, { useCallback } from 'react';

import styled from 'styled-components';

import PlusIcon from 'src/assets/icons/plus.svg';
import Spinner from 'src/assets/icons/spinner_animated_blue_xl.svg';
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
  color: ${colors.updTextPrimary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: ${px(182)};
`;

const CreateSurveyButton = styled(Button)`
  background-color: ${colors.updPrimary};
  border-radius: ${px(4)};
  width: ${px(164)};
  height: ${px(48)};

  > div:first-child {
    ${typography.bodyMediumSemibold};
    color: ${colors.updBackgroundOnPrimary};
    padding: ${px(12)} ${px(13.5)};
    height: ${px(48)};

    > svg {
      margin-right: ${px(9)};
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
            <Spinner />
            Creating survey...
          </LoadingContent>
        </BackdropOverlay>
      )}
      <CollapseSection
        title="Survey Management"
        headerExtra={
          <CreateSurveyButton icon={<PlusIcon />} fill="solid" onClick={handleCreateSurveyClick}>
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
