import React, { useCallback, useMemo, useState } from 'react';

import _orderBy from 'lodash/orderBy';
import _uniq from 'lodash/uniq';
import _pick from 'lodash/pick';
import styled from 'styled-components';

import Card from 'src/common/components/Card';
import Button from 'src/common/components/Button';
import { px, colors } from 'src/styles';
import Table, {
  ColumnOptions,
  getColumnWidthInPercents,
  SortCallback,
  SortParams,
} from 'src/common/components/Table';
import DownloadIcon from 'src/assets/icons/download.svg';
import DownloadSmallIcon from 'src/assets/icons/download_small.svg';
import { ParticipantId } from 'src/modules/study-management/participant-management/lab-visit/ParticipantId';
import { PAGINATION_LIMITS, PaginationProps } from 'src/common/components/Pagination';
import {
  ActivityTaskResponse,
  TaskItemResponseValue,
  TaskItemResponseFormattedValue,
} from 'src/modules/api/models/tasks';
import { downloadFileByUrl } from 'src/common/utils/file';
import downloadMultiple, { FilesList } from 'src/common/utils/downloadMultiple';
import ServiceScreen from 'src/common/components/ServiceScreen';
import useDownloadSnackbar from 'src/common/utils/useDownloadSnackbar';

import { DATA_KEY, DOWNLOAD_FILE_KEYS, EXPORTED_DATA_KEY } from './activityPage.slice';

const RAW_DATA_CARD_MIN_HEIGHT = 500;

const RawDataCard = styled(Card)`
  min-height: ${px(RAW_DATA_CARD_MIN_HEIGHT)};
`;

const ParticipantContainer = styled.div`
  width: ${px(370)};
  margin-bottom: ${px(15)};

  input {
    background-color: ${colors.surface};
  }
`;

const ServiceScreenStyled = styled(ServiceScreen)`
  margin-top: ${px(150)};
`;

const FileColumnValue = styled.div`
  &:hover {
    color: ${colors.primary};
    cursor: pointer;
  }
`;

const RawDataTable = styled(Table)`
  margin-top: ${px(10)};
` as typeof Table;

const DownloadIconStyled = styled(DownloadIcon)<{ $disabled?: boolean }>`
  path {
    fill: ${({ $disabled }) => $disabled && colors.primaryDisabled};
  }
`;

const DownloadSmallIconStyled = styled(DownloadSmallIcon)`
  cursor: pointer;
  fill: ${colors.primary};
`;

const handleExportFiles = async (rows: TaskItemResponseValue[]) => {
  const columnsToPick = [DATA_KEY, EXPORTED_DATA_KEY].concat(DOWNLOAD_FILE_KEYS);
  const urls = rows.flatMap((r) =>
    Object.values(_pick(r, columnsToPick)).map(({ label, url, fileSize: size }) => ({
      url,
      name: label || Date.now().toString(),
      size,
    }))
  );

  let files: FilesList = [];

  files = await Promise.all(
    urls.map(async ({ url, name, size }, idx) => {
      const duplicatedNamesCount = urls.slice(0, idx + 1).filter((u) => u.name === name).length;

      return {
        url,
        name: `${duplicatedNamesCount > 1 ? `(${duplicatedNamesCount - 1})` : ''}${name}`,
        size,
      };
    })
  );

  if (files.length) {
    await (await downloadMultiple(files, undefined, true)).listenOrThrow();
  }
};

const DownloadRowFiles: React.FC<{ row: TaskItemResponseValue }> = ({ row }) => {
  const handleDownloadAllFiles = useDownloadSnackbar(() => handleExportFiles([row]));

  return <DownloadSmallIconStyled data-testid="download-row" onClick={handleDownloadAllFiles} />;
};

type Props = {
  data?: ActivityTaskResponse;
  isLoading?: boolean;
  refetch: () => void;
  error?: string;
};

const ActivityResponses: React.FC<Props> = ({ data: originalData, isLoading, error, refetch }) => {
  const columns: ColumnOptions<TaskItemResponseValue>[] = useMemo(
    () =>
      originalData?.columns
        ? originalData.columns
            .filter(({ key }) => key !== EXPORTED_DATA_KEY)
            .map(({ key, label }) => ({
              dataKey: key,
              label,
              $width: getColumnWidthInPercents(173),
              render: (v: TaskItemResponseFormattedValue) => {
                const { label: itemLabel, url, fileSize } = v || { label: '' };
                return fileSize ? (
                  <FileColumnValue onClick={() => downloadFileByUrl(url, itemLabel)}>
                    {itemLabel}
                  </FileColumnValue>
                ) : (
                  itemLabel
                );
              },
            }))
        : [],
    [originalData?.columns]
  );

  const participants = useMemo(
    () => _uniq(originalData?.responses.map(({ userId }) => userId).filter((p) => p)),
    [originalData?.responses]
  );

  const [participantId, setParticipantId] = useState('');
  const [sort, setSort] = useState<SortParams<TaskItemResponseValue>>({
    column: '',
    direction: 'asc',
  });
  const [pagination, setPagination] = useState<Partial<PaginationProps> | undefined>();

  const filteredData = useMemo(
    () =>
      originalData?.responses
        .filter(({ userId }) => userId === participantId)
        .map(({ result }) => result) ?? [],
    [originalData, participantId]
  );

  const computedData = useMemo(
    () =>
      _orderBy(filteredData, [sort.column], [sort.direction]).slice(
        pagination?.offset || 0,
        (pagination?.offset || 0) + (pagination?.pageSize || PAGINATION_LIMITS[0])
      ),
    [filteredData, pagination, sort]
  );

  const isEmpty = !filteredData?.length;

  const onSortChange: SortCallback<TaskItemResponseValue> = useCallback((sortings) => {
    const { column, direction } = sortings[0];

    setSort({ column, direction });
  }, []);

  const onPageChange: PaginationProps['onPageChange'] = useCallback(
    (offset, pageSize) => {
      setPagination({ ...pagination, pageSize, offset });
    },
    [pagination]
  );

  const noData = !isLoading && (isEmpty || !participantId);

  const oneRowResult = filteredData.length === 1;

  const handleDownloadAllFiles = useDownloadSnackbar(() => handleExportFiles(computedData));

  const exportAllDisabled = !computedData.length;

  return (
    <>
      <ParticipantContainer>
        {!isLoading && (
          <ParticipantId
            ignoreEmptyParticipant
            value={participantId ?? ''}
            onChange={(pId) => setParticipantId(pId)}
            suggestions={
              (participants?.filter((p) => !participantId || p?.startsWith(participantId)) ||
                []) as string[]
            }
            onValidateChange={() => {}}
          />
        )}
      </ParticipantContainer>
      <RawDataCard
        loading={isEmpty && isLoading}
        error={!isLoading && !!error}
        onReload={refetch}
        title="Collected Data"
        action={
          <Button
            rate="small"
            width={164}
            icon={<DownloadIconStyled $disabled={exportAllDisabled} />}
            disabled={exportAllDisabled}
            fill="bordered"
            onClick={handleDownloadAllFiles}
            data-testid="export-all-button"
          >
            Export all
          </Button>
        }
      >
        {noData ? (
          <ServiceScreenStyled
            type="empty"
            title={participantId ? 'No Data' : 'No ID entered yet'}
          />
        ) : (
          <RawDataTable
            renderOnHoverRowAction={(r) => <DownloadRowFiles row={r} />}
            stickyHeader
            stickyFooter
            columns={columns}
            virtual={computedData.length > PAGINATION_LIMITS[0]}
            isLoading={isLoading}
            getRowKey={(r) => Object.values(r).join('-')}
            rows={computedData}
            sort={
              oneRowResult
                ? undefined
                : {
                    onSortChange,
                    sortings: [sort],
                  }
            }
            pagination={
              oneRowResult
                ? undefined
                : {
                    pageSize: pagination?.pageSize || PAGINATION_LIMITS[0],
                    totalCount: filteredData?.length,
                    offset: pagination?.offset || 0,
                    onPageChange,
                  }
            }
          />
        )}
      </RawDataCard>
    </>
  );
};

export default ActivityResponses;
