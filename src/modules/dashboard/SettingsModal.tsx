import React from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Modal from 'src/common/components/Modal';
import Toggle from 'src/common/components/Toggle';
import Dropdown from 'src/common/components/Dropdown';
import Checkbox from 'src/common/components/CheckBox';
import { useChartList } from './chart-list/chartList.slice';
import { useAutoRefresh } from './autoRefresh.slice';
import { useSettingsModal } from './settingsModal.slice';
import { useTranslation } from '../localization/useTranslation';
import { timesAutoRefresh } from './dashboard.utils';

export type SettingsModalProps = {
  data?: { studyId: string; dashboardId: string; };
  onClose: () => void;
};

const SettingsModal = ({ data, onClose }: SettingsModalProps) => {
  const { t } = useTranslation();
  const { data: charts = [] } = useChartList();
  const { studyAutoRefreshValue, setStudyAutoRefresh } = useAutoRefresh(data?.dashboardId);
  const {
    isOn,
    timeAutoRefresh,
    selectedCharts,
    onCustomAutoRefreshChange,
    onTimeAutoRefreshChange,
    onSelectedChartChange,
  } = useSettingsModal(studyAutoRefreshValue, data);

  const onAcceptClick = async () => {
    if (!data) return;
    const selected = Object.keys(selectedCharts).reduce((prev, id) => {
      if (!selectedCharts[id]) return prev;
      return { ...prev, [id]: true };
    }, {});
    const value = {
      on: isOn,
      time: timeAutoRefresh,
      charts: selected
    };
    setStudyAutoRefresh(value, data);
    onClose();
  };

  return (
    <Modal
      title={t('TITLE_SETTINGS')}
      acceptLabel={t('TITLE_SAVE')}
      declineLabel={t('TITLE_CANCEL_BUTTON')}
      open={!!data}
      onAccept={onAcceptClick}
      onDecline={onClose}
    >
      <Container data-testid='setting-modal'>
        <Header>
          <div>
            <Title>{t('TITLE_AUTO_REFRESH')}</Title>
            <Description>{t('CAPTION_AUTO_REFRESH')}</Description>
          </div>
          <div>
            <Toggle
              data-testid='toggle-button'
              checked={isOn}
              onChange={onCustomAutoRefreshChange}
            />
          </div>
        </Header>
        <Main disabled={!isOn}>
          <Label>{t('LABEL_AFTER')}</Label>
          <Dropdown
            data-testid='timer-dropdown'
            disabled={!isOn}
            style={{ width: 200, marginBottom: 16 }}
            items={timesAutoRefresh}
            activeKey={timeAutoRefresh}
            onChange={onTimeAutoRefreshChange}
          />
          <Label>{t('LABEL_CHART_LIST')}</Label>
          <SubLabel>{t('CAPTION_CHART_LIST')}</SubLabel>
          <List>
            {(charts).map((chart) => (
              <Item key={chart.id}>
                <Checkbox
                  data-testid='checkbox-select-chart'
                  disabled={!isOn}
                  checked={!!selectedCharts[chart.id]}
                  onChange={() => onSelectedChartChange(chart.id, !selectedCharts[chart.id])}
                >
                  {chart.configBasic.name || t('LABEL_NO_NAME')}
                </Checkbox>
              </Item>
            ))}
          </List>
        </Main>
      </Container>
    </Modal>
  );
};

export default SettingsModal;

const Container = styled.div`
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${px(24)};
`;
const Title = styled.h4`
  margin: 0 0 ${px(8)} 0;
`;
const Description = styled.h6`
  margin: 0;
`;

const Main = styled.div<{ disabled?: boolean }>`
  margin-bottom: ${px(24)};
  opacity: ${({ disabled }) => (disabled ? 0.8 : 1)};
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'initial'};
`;
const Label = styled.label`
  display: block;
  margin: 0;
`;
const SubLabel = styled.span`
  display: block;
  font-size: ${px(12)};
`;
const List = styled.ul`
  margin: 0;
  overflow: hidden auto;
  max-height: ${px(400)};
  padding: 0 ${px(16)} 0 0;
`;
const Item = styled.li`
  overflow: hidden;
  white-space: nowrap;
  list-style-type: none;
`;
