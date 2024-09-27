import React, { useCallback, useMemo, useState } from 'react';
import { push } from 'connected-react-router';
import { generatePath } from 'react-router-dom';

import styled from 'styled-components';
import createGlobalState from 'react-use/lib/factory/createGlobalState';

import { Path } from 'src/modules/navigation/store';
import SimpleGrid from 'src/common/components/SimpleGrid';
import Button from 'src/common/components/Button';
import CollapseSection from 'src/common/components/CollapseSection';
import Tabs from 'src/common/components/Tabs';
import SurveyList from './survey/SurveyList';
import ActivitiesList from './activity/ActivitiesList';
import CreateActivityTask from './activity/CreateActivityTask';
import { px } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { useTranslation } from 'src/modules/localization/useTranslation';

import PlusIcon from 'src/assets/icons/plus.svg';

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

const TaskManagement = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useActiveTabState();
  const [isCreateActivityOpen, setCreateActivityOpen] = useState(false);

  const handleCreateSurveyClick = useCallback(() => {
    dispatch(push(generatePath(Path.CreateSurvey)));
  }, [dispatch]);

  const handleCreateActivityClick = useCallback(() => setCreateActivityOpen(true), []);
  const handleCloseCreateActivityModal = useCallback(() => setCreateActivityOpen(false), []);

  const tabs = useMemo(
    () =>
      [
        [
          t('TITLE_SURVEYS'),
          () => <SurveyList />,
          { onClick: handleCreateSurveyClick, children: t('TITLE_CREATE_SURVEY') },
        ],
        [
          t('TITLE_ACTIVITIES'),
          () => <ActivitiesList />,
          { onClick: handleCreateActivityClick, children: t('TITLE_CREATE_ACTIVITY') },
        ],
      ] as const,
    [handleCreateSurveyClick, handleCreateActivityClick]
  );

  const tabsLabels = useMemo(() => tabs.map((t) => t[0]), [tabs]);
  const tabsContent = useMemo(() => tabs.map((t) => t[1])[activeTab], [activeTab, tabs]);
  const createButtonProps = useMemo(() => tabs.map((t) => t[2])[activeTab], [activeTab, tabs]);

  return (
    <SimpleGrid fullScreen>
      <CollapseSection
        data-testid="task-management"
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
    </SimpleGrid>
  );
};

export default React.memo(TaskManagement, () => true);
