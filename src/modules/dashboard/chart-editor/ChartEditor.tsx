import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { boxShadow, colors, px } from 'src/styles';
import { Path } from 'src/modules/navigation/store';
import { hasSomeChartErrors, useChartEditor } from './chartEditor.slice';
import { useShowSnackbar } from 'src/modules/snackbar';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import useHistoryChangeOnce from 'src/common/hooks/useHistoryChangeOnce';
import { convertConfigSpecificWhenBasicConfigChange, convertConfigSpecificWhenSourceChange, useModal } from '../components/chart.utils';

import Header from './Header';
import BasicConfig from './BasicConfig';
import ChartConfig from './ChartConfig';
import SourceConfig from './SourceConfig';
import ChartPreview from './ChartPreview';
import ConfirmDeleteModal from '../components/ConfirmModal';
import SourceModal, { SourceModalData } from './SourceModal';
import SimpleGrid, { SimpleGridCell } from 'src/common/components/SimpleGrid';
import type { ChartConfigBasic, ChartConfigSpecific } from 'src/modules/api';


const ChartEditor = () => {
  const history = useHistory();
  const pathParams = useParams<{ dashboardId: string; chartId?: string }>();

  const studyId = useSelectedStudyId();
  const showSnackbar = useShowSnackbar();

  const deleteModal = useModal<string>();
  const sourceModal = useModal<SourceModalData>();

  const {
    isLoading,
    isSaving,
    data,
    errors,
    loadChart,
    generateChart,
    saveChart,
    removeChart,
    updateChart,
    validateChart,
    updateChartErrors,
    reset,
  } = useChartEditor();

  const [isError, setIsError] = useState<boolean>(false);

  const loadingState = isLoading || !studyId;

  const errorText = useMemo(() => {
    if (errors?.sourceResult.empty) return 'An error occurred while retrieving data. Please check the source again.';
    return '';
  }, [errors]);

  useHistoryChangeOnce(async () => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!studyId) return;

    const snackbarOnLoadError = () =>
      showSnackbar({
        text: 'Error',
        duration: 0,
        actionLabel: 'back',
        showErrorIcon: true,
        onAction: () => history.push(Path.Dashboard),
      });

    if (!pathParams.chartId) {
      generateChart({ studyId, dashboardId: pathParams.dashboardId });
    } else {
      loadChart({ studyId, dashboardId: pathParams.dashboardId, chartId: pathParams.chartId, onError: snackbarOnLoadError });
    }
  }, [studyId, pathParams.dashboardId, pathParams.chartId]);

  const onOpenSource = () => {
    sourceModal.open({
      source: data.source,
      result: data.sourceResult,
    });
  };
  const onSourceChange = (sourceModalData: Required<SourceModalData>) => {
    const configSpecific = convertConfigSpecificWhenSourceChange(sourceModalData.source, data);
    updateChart({
      source: sourceModalData.source,
      sourceResult: sourceModalData.result,
      configSpecific
    });
  };
  const onBasicConfigChange = (configBasic: Partial<ChartConfigBasic>) => {
    const configSpecific = convertConfigSpecificWhenBasicConfigChange(configBasic, data);
    updateChart({ configBasic, configSpecific });
  };
  const onConfigChange = (configSpecific: Partial<ChartConfigSpecific>) => {
    updateChart({ configSpecific });
  };

  const onValidatePreviewChange = (error?: string) => {
    updateChartErrors({ preview: !!error });
  };

  const onSave = () => {
    const errors = validateChart();
    if (hasSomeChartErrors(errors)){
      setIsError(true);
      return;
    }
    setIsError(false);
    saveChart();
  };

  const onDelete = () => {
    if (!pathParams.chartId) return;
    deleteModal.open(pathParams.chartId);
  };
  const onDeleted = () => {
    removeChart();
  };

  return (
    <EditorContainer data-testid="chart-editor">
      <ContentContainer>
        <Header
          error={isError}
          backTitle="Dashboard"
          isSaving={isSaving}
          onSave={onSave}
          onDelete={!pathParams.chartId ? undefined : onDelete}
        />
        <SimpleGrid
          verticalGap
          columns={{ desktop: 4, laptop: 3, tablet: 2 }}
        >
          <SimpleGridCell
            columns={{ desktop: [1, 1], laptop: [1, 1], tablet: [1, 1] }}
            rows={{ desktop: [1, 2], laptop: [1, 2], tablet: [1, 2] }}
          >
            <SourceCard>
              <BasicConfig
                errors={errors?.configBasic}
                loading={loadingState}
                configBasic={data.configBasic}
                onChange={onBasicConfigChange}
              />
              <SourceConfig
                errors={errors?.source}
                loading={loadingState}
                source={data.source}
                sourceResult={data.sourceResult}
                onChange={onOpenSource}
              />
            </SourceCard>
          </SimpleGridCell>
          <SimpleGridCell
            columns={{ desktop: [2, 2], laptop: [1, 1], tablet: [2, 2] }}
            rows={{ desktop: [1, 2], laptop: [2, 3], tablet: [1, 2] }}
          >
            <ConfigCard>
              <ChartConfig
                loading={loadingState}
                sourceResult={data.sourceResult}
                configBasic={data.configBasic}
                configSpecific={data.configSpecific}
                onChange={onConfigChange}
              />
            </ConfigCard>
          </SimpleGridCell>
          <SimpleGridCell
            columns={{ desktop: [3, 4], laptop: [2, 3], tablet: [1, 2] }}
            rows={{ desktop: [1, 2], laptop: [1, 3], tablet: [2, 3] }}
          >
            <PreviewCard>
              <ChartPreview
                loading={loadingState}
                sourceResult={data.sourceResult}
                configBasic={data.configBasic}
                configSpecific={data.configSpecific}
                onValidateChange={onValidatePreviewChange}
              />
              <Message>{errorText}</Message>
            </PreviewCard>
          </SimpleGridCell>
        </SimpleGrid>
      </ContentContainer>
      <SourceModal
        data={sourceModal.data}
        onRequestClose={sourceModal.close}
        onSaved={onSourceChange}
      />
      <ConfirmDeleteModal
        dashboardId={pathParams.dashboardId}
        chart={deleteModal.data}
        onClose={deleteModal.close}
        onDeleted={onDeleted}
      />
    </EditorContainer>
  )
};

export default ChartEditor;

const EditorContainer = styled.div`
`;

const ContentContainer = styled.div`
`;

const SourceCard = styled.div`
  height: 100%;
  box-sizing: border-box;
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
  padding: ${px(24)} ${px(24)} ${px(16)};
`;
const ConfigCard = styled.div`
  height: 100%;
  box-sizing: border-box;
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
  padding: ${px(24)} ${px(24)} ${px(16)};
`;
const PreviewCard = styled.div`
  height: 100%;
  box-sizing: border-box;
  min-height: ${px(528)};
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
  padding: ${px(24)} ${px(24)} ${px(16)};
`;
const Message = styled.div`
  text-align: center;
  margin-top: ${px(16)};
  color: ${({ theme }) => theme.colors.statusErrorText};
`;
