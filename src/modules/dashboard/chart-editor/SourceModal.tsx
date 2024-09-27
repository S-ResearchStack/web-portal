import React, { useCallback, useMemo, useState } from 'react';
import _isObject from 'lodash/isObject';
import _isEqual from 'lodash/isEqual';
import styled from 'styled-components';
import { Grid } from '@mui/material';

import { px, colors } from 'src/styles';
import Modal from 'src/common/components/Modal';
import Card from 'src/common/components/Card';
import Button from 'src/common/components/Button';
import SQLInputField from 'src/modules/dashboard/chart-editor/SqlInputField';
import TableQueryResult from './TableQueryResult';
import QuerySelectorViewer from './QuerySelectorViewer';
import { useSourceModal } from './sourceModal.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import type { ChartSource, QueryResponse } from 'src/modules/api';

export type SourceModalData = {
  source?: ChartSource;
  result?: QueryResponse;
};
export type SourceModalProps = {
  data?: SourceModalData;
  onSaved: (data: Required<SourceModalData>) => void;
  onRequestClose: () => void;
};

const SourceModal = ({ data, onRequestClose, onSaved }: SourceModalProps) => {
  const [isChanged, setIsChanged] = useState(false);
  const studyId = useSelectedStudyId() || '';

  const { modalProps, cachedData, baseData, updateSourceData, executeQuery, loading } =
    useSourceModal(data);

  const showWarning =
    cachedData?.source?.database !== baseData?.source?.database ||
    cachedData?.source?.query !== baseData?.source?.query;
  const disableAccept =
    !isChanged || !baseData || !baseData.source || !baseData.result || !!baseData.errors;
  const disableExecuteQuery =
    !cachedData || !cachedData.source || !cachedData.source.database || !cachedData.source.query;

  const message = useMemo(() => {
    if (!!cachedData?.errors?.message)
      return cachedData.errors.message;
    if (showWarning)
      return 'You have made changes but have not yet run the query. Please execute the query before saving.';
    return null;
  }, [cachedData?.errors, showWarning])

  const onChangeDatabase = (value: string) => {
    updateSourceData({
      database: value,
    });
  };
  const onChangeQuery = (value: string) => {
    updateSourceData({
      query: value,
    });
  };

  const onExecuteQuery = () => {
    if (disableExecuteQuery || !cachedData || !cachedData.source) return;

    executeQuery(studyId);
    setIsChanged(true);
  };

  const handleDecline = useCallback(() => {
    setIsChanged(false);
    onRequestClose();
  }, [setIsChanged, onRequestClose]);

  const handleSave = useCallback(async () => {
    if (disableAccept || !baseData || !baseData.result || !baseData.source) return;
    onSaved({
      source: baseData.source,
      result: baseData.result,
    });
    handleDecline();
  }, [disableAccept, baseData, onSaved, handleDecline]);

  return (
    <Modal
      {...modalProps}
      title="Source"
      size="xlarge"
      acceptLabel="Save"
      declineLabel="Cancel"
      disableAccept={disableAccept}
      onAccept={handleSave}
      onDecline={handleDecline}
    >
      <CardContainer style={{ flex: 3 }}>
        <Grid
          container
          paddingLeft={1}
          paddingRight={1}
          columnSpacing={2}
          alignContent="flex-start"
        >
          <BodyContainer>
            <Grid container height='100%'>
              <Grid item xs={3}>
                <QuerySelectorViewer
                  database={cachedData?.source?.database || ''}
                  onChangeDatabase={onChangeDatabase}
                />
              </Grid>
              <Grid item xs={9}>
                <QueryResultContainer>
                  <Grid>
                    <Grid container>
                      <Grid item xs={9}>
                        <SQLInputField
                          label="SQL Query"
                          error={!!cachedData?.errors}
                          value={cachedData?.source?.query || ''}
                          onChange={(e) => onChangeQuery(e)}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <ButtonContainer>
                          <RunButton
                            data-testid="run-query-button"
                            rate="small"
                            fill="bordered"
                            disabled={!cachedData?.source?.database || !cachedData?.source?.query}
                            onClick={onExecuteQuery}
                          >
                            Run query
                          </RunButton>
                        </ButtonContainer>
                      </Grid>
                    </Grid>
                    <Grid item height={312}>
                      <TableQueryResult
                        queryResponse={cachedData?.result || { columns: [], data: [] }}
                        isLoading={loading}
                      />
                    </Grid>
                  </Grid>
                </QueryResultContainer>
              </Grid>
            </Grid>
          </BodyContainer>
        </Grid>
        <Message>
          {message}
        </Message>
      </CardContainer>
    </Modal>
  );
};

export default SourceModal;

const CardContainer = styled(Card) <{ flex?: number; width?: string }>`
  flex: ${(p) => p.flex ?? 1};
  padding-top: 16px;
  padding-left: 8px !important;
  padding-right: 8px !important;
  height: 45vh;
  width: ${(p) => p.width};
  flex-shrink: 0;
`;

const BodyContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: ${px(8)};
  margin: ${px(8)};
`;

const QueryResultContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: ${px(16)};
  margin-left: ${px(16)};
  border-radius: ${px(4)};
  border: solid 1px ${colors.black08};
`;

const ButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const RunButton = styled(Button)`
  width: ${px(164)};
`;

const Message = styled.div`
  height: ${px(18)};
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
`;
