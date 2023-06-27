import React, { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import createGlobalState from 'react-use/lib/factory/createGlobalState';

import PlusIcon from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import CollapseSection from 'src/common/components/CollapseSection';
import CreatingLoader from 'src/modules/study-management/user-management/common/CreatingLoader';
import { px } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import Tabs from 'src/common/components/Tabs';
import { useSurveyListData } from './surveyList.slice';
import ActivitiesList from '../activity/ActivitiesList';
import { useActivitiesListData } from '../activity/activitiesList.slice';
import { createSurvey, useSurveyEditor } from './survey-editor/surveyEditor.slice';
import SurveyList from './SurveyList';
import CreateActivityTask from '../activity/CreateActivityTask';

const CreateSurveyButton = styled(Button)`
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

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${px(24)};
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const useActiveTabState = createGlobalState(0);

const SurveyManagement = () => {
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();
  const { isCreating: isCreatingSurvey } = useSurveyEditor();

  const [isCreateActivityOpen, setCreateActivityOpen] = useState(false);

  const {
    data: surveyListData,
    isLoading: isSurveyListLoading,
    fetchArgs: surveyFetchArgs,
    reset: surveyReset,
  } = useSurveyListData({
    fetchArgs: studyId ? { studyId } : false,
  });

  const {
    data: activitiesListData,
    isLoading: isActivitiesListLoading,
    fetchArgs: activitiesFetchArgs,
    reset: activitiesReset,
  } = useActivitiesListData({
    fetchArgs: studyId ? { studyId } : false,
  });

  useEffect(() => {
    if (!!surveyFetchArgs?.studyId && surveyFetchArgs?.studyId !== studyId) {
      surveyReset();
    }

    if (!!activitiesFetchArgs?.studyId && activitiesFetchArgs?.studyId !== studyId) {
      activitiesReset();
    }
  }, [surveyFetchArgs, activitiesFetchArgs, studyId, surveyReset, activitiesReset]);

  const handleCreateSurveyClick = useCallback(() => {
    studyId && dispatch(createSurvey({ studyId }));
  }, [studyId, dispatch]);

  const handleCreateActivityClick = useCallback(() => setCreateActivityOpen(true), []);
  const handleCloseCreateActivityModal = useCallback(() => setCreateActivityOpen(false), []);

  const isSurveyListEmpty =
    !isSurveyListLoading && !surveyListData?.drafts.length && !surveyListData?.published.length;
  const isActivitiesListEmpty =
    !isActivitiesListLoading &&
    !activitiesListData?.drafts.length &&
    !activitiesListData?.published.length;

  const isSurveyCollapsed = isSurveyListEmpty && isActivitiesListEmpty;
  const isGlobalLoading = isSurveyListEmpty && (isActivitiesListLoading || isSurveyListLoading);

  const [activeTab, setActiveTab] = useActiveTabState();

  const tabs = useMemo(
    () =>
      [
        [
          'Surveys',
          () => <SurveyList isLoading={isGlobalLoading} />,
          { onClick: handleCreateSurveyClick, children: 'Create survey' },
        ],
        [
          'Activities',
          () => <ActivitiesList isLoading={isGlobalLoading} />,
          { onClick: handleCreateActivityClick, children: 'Create activity' },
        ],
      ] as const,
    [isGlobalLoading, handleCreateActivityClick, handleCreateSurveyClick]
  );

  const tabsLabels = useMemo(() => tabs.map((t) => t[0]), [tabs]);
  const tabsContent = useMemo(() => tabs.map((t) => t[1])[activeTab], [activeTab, tabs]);
  const createButtonProps = useMemo(() => tabs.map((t) => t[2])[activeTab], [activeTab, tabs]);

  return (
    <>
      <CreatingLoader open={isCreatingSurvey} label="Creating survey..." />
      <CollapseSection
        defaultCollapsed={isSurveyCollapsed}
        data-testid="survey-management"
        title="TASK MANAGEMENT"
      >
        <CollapseContent>
          <TabsContainer>
            <Tabs items={tabsLabels} activeItemIdx={activeTab} onTabChange={setActiveTab} />
            <CreateSurveyButton {...createButtonProps} icon={<PlusIcon />} fill="solid" />
          </TabsContainer>
          <TabContent>{tabsContent()}</TabContent>
        </CollapseContent>
      </CollapseSection>
      <CreateActivityTask
        open={isCreateActivityOpen}
        onRequestClose={handleCloseCreateActivityModal}
      />
    </>
  );
};

export default React.memo(SurveyManagement, () => true);
