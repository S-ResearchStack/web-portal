import React, { useMemo, useEffect, useCallback, useRef, useState, useLayoutEffect } from 'react';
import useMeasureDirty from 'react-use/lib/useMeasureDirty';
import useMount from 'react-use/lib/useMount';

import styled from 'styled-components';

import { BASE_CARD_PADDING, TitleContainer } from 'src/common/components/Card';
import { useShowSnackbar } from 'src/modules/snackbar';
import ErrorIcon from 'src/assets/icons/error.svg';
import ServiceScreen from 'src/common/components/ServiceScreen';
import Table from 'src/common/components/Table';
import Dropdown from 'src/common/components/Dropdown';
import OverviewCard from 'src/modules/overview/OverviewCard';
import Button from 'src/common/components/Button';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import PlusIcon from 'src/assets/icons/plus_small.svg';
import { downloadFile } from 'src/common/utils/file';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { px, colors, typography } from 'src/styles';
import {
  getQueryParamsFromSql,
  updateQsBySorter,
  updateQsByPagination,
  getCsvBlobFromQueryResult,
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_OFFSET,
} from './helpers';
import {
  queryResultSelector,
  querySelector,
  tablesSelector,
  errorSelector,
  setQuery,
  fetchTables,
  dataFetchData,
  clear,
  setTable,
  fetchColumns,
  dataLoadingSelector,
  tablesLoadingSelector,
} from './dataCollection.slice';
import SqlQueryEditor from './SqlQueryEditor/SqlQueryEditor';

const DEFAULT_COLUMN_WIDTH = 150;

const TableStyled = styled(Table)`
  height: 100%;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  margin-top: ${px(20)};
  display: flex;
  flex-direction: column;
  row-gap: ${px(16)};
`;

const ServiceScreenStyled = styled(ServiceScreen)`
  height: ${px(410)};
`;

const DropdownContainer = styled.div`
  width: ${px(296)};
`;

const CardStyled = styled(OverviewCard)`
  padding-top: ${px(16)} !important;
  p {
    padding-top: ${px(8)};
  }
  > div > div:nth-child(2) {
    margin-top: 0;
  }
  > ${TitleContainer} {
    height: ${px(64)};
  }
`;

const ErrorContainer = styled.div`
  min-height: ${px(40)};
  display: flex;
  align-items: center;
  padding: ${px(10)} ${px(18)};
  ${typography.bodySmallRegular};
  color: ${colors.statusErrorText};
  background-color: ${colors.statusError10};
  border-radius: ${px(4)};
  margin-top: ${px(8)};
`;

const ErrorIconContainer = styled.div`
  margin-right: ${px(16)};

  svg {
    fill: ${colors.statusError};
  }
`;

const DataCollection = () => {
  const studyId = useSelectedStudyId();

  const error = useAppSelector(errorSelector);
  const query = useAppSelector(querySelector);
  const tables = useAppSelector(tablesSelector);
  const queryResult = useAppSelector(queryResultSelector);
  const isDataLoading = useAppSelector(dataLoadingSelector);
  const isTablesLoading = useAppSelector(tablesLoadingSelector);

  const showSnackbar = useShowSnackbar();

  const dispatch = useAppDispatch();

  useMount(() => dispatch(clear()));

  useEffect(() => {
    if (studyId && !tables && !isTablesLoading) {
      dispatch(fetchTables(studyId));
    }
  }, [studyId, isTablesLoading, dispatch, tables]);

  const executeQuery = useCallback(() => {
    studyId && dispatch(dataFetchData(studyId, query));
  }, [studyId, query, dispatch]);

  const handleSetQuery = useCallback(
    (qs: string, autoFetch = false) => {
      studyId && dispatch(setQuery(studyId, qs, autoFetch));
    },
    [studyId, dispatch]
  );

  const tableName = useMemo(() => getQueryParamsFromSql(query).tableName, [query]);
  const { queryParams } = queryResult || {};
  const { limit, offset, sortings } = queryParams || {};

  const tablesColumnsMap = useMemo(() => new Map(Object.entries(tables || {})), [tables]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current?.parentElement?.parentElement) {
      // TODO: only for demo (colors.background)
      containerRef.current.parentElement.parentElement.style.backgroundColor = '#F7F8FA';
    }
  }, []);

  const pageSize = limit || DEFAULT_PAGINATION_LIMIT;

  const tablesNames = useMemo(
    () => Object.keys(tables || {}).map((tId) => ({ label: tId, key: tId })),
    [tables]
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const cardParams = useMeasureDirty(cardRef);
  const [columnWidth, setColumnWidth] = useState<number>(DEFAULT_COLUMN_WIDTH);

  const columns = useMemo(
    () =>
      queryResult?.metadata?.columns.map((dataKey) => ({
        dataKey,
        label: dataKey,
        $width: columnWidth,
      })) || [],
    [queryResult?.metadata, columnWidth]
  );

  const actualOffset = offset || DEFAULT_PAGINATION_OFFSET;

  const tableComponent = queryResult ? (
    <TableStyled
      withRipple={false}
      stickyHeader
      isLoading={isDataLoading}
      sort={{
        multiSort: true,
        onSortChange: (newSortings) =>
          handleSetQuery(
            updateQsBySorter(
              query,
              newSortings.map(({ column, direction }) => ({
                dataIndex: column,
                order: direction,
              }))
            ),
            true
          ),
        sortings: (sortings || []).map(({ dataIndex, order }) => ({
          column: dataIndex as never,
          direction: order,
        })),
      }}
      rows={(queryResult?.data || []) as Record<string, string | number>[]}
      columns={columns}
      getRowKey={(r) => Object.values(r as Record<string, unknown>).join('')}
      pagination={
        queryResult?.metadata?.count
          ? {
              totalCount: queryResult?.totalCount || 0,
              pageSize,
              offset: actualOffset,
              onPageChange: (newOffset: number, size: number) =>
                handleSetQuery(
                  updateQsByPagination(query, {
                    limit: size,
                    offset: newOffset,
                  }),
                  true
                ),
            }
          : undefined
      }
    />
  ) : (
    <ServiceScreenStyled type="empty" title="No data selected yet" />
  );

  // TODO: move to Table
  useLayoutEffect(() => {
    if (queryResult?.metadata?.columns?.length) {
      const possibleCellSize =
        (cardParams.width - BASE_CARD_PADDING * 2) / queryResult.metadata.columns.length;
      const width =
        possibleCellSize > DEFAULT_COLUMN_WIDTH
          ? 1 / (queryResult?.metadata?.columns?.length || 1)
          : DEFAULT_COLUMN_WIDTH;
      setColumnWidth(width);
    }
  }, [queryResult, cardParams]);

  const isTableExist = tablesNames.some(({ label }) => tableName === label);
  const tableColumnsUpdated = tableName && tablesColumnsMap.get(tableName)?.length;

  useEffect(() => {
    !tableColumnsUpdated &&
      tableName &&
      studyId &&
      isTableExist &&
      dispatch(fetchColumns(studyId, tableName));
  }, [tableName, dispatch, studyId, isTableExist, tableColumnsUpdated]);

  return (
    <Container>
      <DropdownContainer>
        <Dropdown
          loading={isTablesLoading}
          disabled={isTablesLoading || isDataLoading}
          items={tablesNames}
          activeKey={tableName || ''}
          onChange={(key) => studyId && dispatch(setTable(studyId, key))}
          placeholder="Select a table"
          backgroundType="light"
          menuItemHeight={48}
        />
      </DropdownContainer>
      <div>
        <SqlQueryEditor
          isError={!!error}
          tablesColumnsMap={tablesColumnsMap}
          value={query}
          onSearch={executeQuery}
          onChange={(q) => handleSetQuery(q)}
          searchDisabled={!tableName || isDataLoading}
        />
        {error && (
          <ErrorContainer>
            <ErrorIconContainer>
              <ErrorIcon />
            </ErrorIconContainer>
            <span>{error}</span>
          </ErrorContainer>
        )}
      </div>
      <CardStyled
        ref={cardRef}
        title="Query Results"
        action={
          queryResult && (
            <Button
              rate="small"
              width={164}
              icon={<PlusIcon />}
              disabled={!queryResult?.data?.length || isDataLoading || isTablesLoading}
              fill="bordered"
              onClick={() => {
                const fileName = `${tableName}.csv`;
                downloadFile(fileName, getCsvBlobFromQueryResult(queryResult));
                showSnackbar({ text: `${fileName} export completed.` });
              }}
            >
              Export .csv
            </Button>
          )
        }
      >
        {isDataLoading ? <ServiceScreenStyled type="loading" title="Loading..." /> : tableComponent}
      </CardStyled>
    </Container>
  );
};

export default DataCollection;
