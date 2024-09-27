import React, { ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import { useSelectedStudyId } from '../studies/studies.slice';
import { useDashboardList } from './dashboardList.slice';
import { useTranslation } from '../localization/useTranslation';

import SettingsModal from './SettingsModal';
import Tabs from 'src/common/components/Tabs';
import Button from 'src/common/components/Button';
import ServiceScreen from 'src/common/components/ServiceScreen';
import ChartList, { ChartListLoading } from './chart-list/ChartList';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import CollapseSection from 'src/common/components/CollapseSection';
import { useCreateChart } from './chart-list/chartList.slice';
import { useModal } from './components/chart.utils';


import PlusIcon from 'src/assets/icons/plus.svg';
import SettingsIcon from 'src/assets/icons/settings.svg';

const DashboardContainer = styled.div`
  margin: 0 50px;
`;

const Dashboard = () => {
  const { t } = useTranslation();
  const studyId = useSelectedStudyId();
  const settingsModal = useModal<{ studyId: string; dashboardId: string; }>();
  const { isEditble, create } = useCreateChart();
  const { isLoading, data, error, refetch } = useDashboardList({
    fetchArgs: !!studyId && { studyId },
  });

  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const tabs = useMemo(() => (data || []).map(c => c.title), [data]);
  const onTabChange = (idx: number) => { setActiveTabIdx(idx) };

  const onAddChart = () => {
    if (!isEditble || !data || !data[activeTabIdx]) return;
    create({ dashboardId: data[activeTabIdx].id });
  };
  const onSettingsClick = () => {
    if (!studyId || !data || !data[activeTabIdx]) return;
    settingsModal.open({ studyId, dashboardId: data[activeTabIdx].id });
  };

  if (!isLoading && error) {
    return (
      <DashboardContainer data-testid="dashboard">
        <CollapseSection
          title={t('TITLE_DASHBOARD')}
        >
          <ServiceScreen
            type="error"
            title="Something went wrong. Please try again later."
            style={{ height: 'calc(100vh - 128px)' }}
            onReload={refetch}
          />
        </CollapseSection>
      </DashboardContainer>
    )
  };

  if (!isLoading && !data?.length) {
    return (
      <DashboardContainer data-testid="dashboard">
        <CollapseSection
          title={t('TITLE_DASHBOARD')}
        >
          <ServiceScreen
            type="empty"
            title="You need to create a dashboard first before you can create a chart."
            style={{ height: 'calc(100vh - 128px)' }}
          />
        </CollapseSection>
      </DashboardContainer>
    )
  };

  if (isLoading || !data) {
    return (
      <DashboardContainer data-testid="dashboard">
        <CollapseSection
          disabled={true}
          title={t('TITLE_DASHBOARD')}
        >
          <TabsContainer>
            <TabsLoading />
            <ButtonsLoading />
          </TabsContainer>
          <ChartListLoading />
        </CollapseSection>
      </DashboardContainer>
    )
  }

  return (
    <DashboardContainer data-testid="dashboard">
      <CollapseSection
        title={t('TITLE_DASHBOARD')}
      >
        <TabsContainer>
          <Tabs items={[]} activeItemIdx={activeTabIdx} onTabChange={onTabChange} />
          <Buttons>
            {isEditble &&
              <AddChartButton
                data-testid='add-chart-button'
                fill="solid"
                icon={<PlusIcon />}
                onClick={onAddChart}
              >
                {t('TITLE_ADD_CHART')}
              </AddChartButton>
            }
            <SettingsButton
              data-testid='setting-button'
              fill="solid"
              disabled={isLoading && !data}
              icon={<SettingsIcon />}
              onClick={onSettingsClick}
            />
          </Buttons>
        </TabsContainer>
        <ChartList studyId={studyId} dashboard={data[activeTabIdx]} />
        <SettingsModal
          data={settingsModal.data}
          onClose={settingsModal.close}
        />
      </CollapseSection>
    </DashboardContainer>
  );
};

export default Dashboard;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${px(24)};
  min-height: ${px(48)};
`;

const Buttons = styled.div`
  display: flex;
  gap: ${px(10)};
`;

const AddChartButton = styled(Button)`
  width: ${px(164)};
`;
const SettingsButton = styled(Button)`
  width: ${px(48)};
  > div:first-child {
    > svg {
      margin-right: 0;
    }
  }
`;

const TabsLoadingContainer = styled.div`
  display: flex;
  column-gap: ${px(32)};
`;
const SkeletonContainer = styled(SkeletonLoading)`
`;

const TabsLoading = () => (
  <TabsLoadingContainer>
  </TabsLoadingContainer>
);

const ButtonsLoading = () => (
  <SkeletonContainer>
    <SkeletonRect x="0" y="0" width="164" height="48" />
    <SkeletonRect x="174" y="0" width="48" height="48" />
  </SkeletonContainer>
);
