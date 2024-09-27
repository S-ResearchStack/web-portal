import React, { useCallback, useMemo, useState } from 'react';
import _isEqual from 'lodash/isEqual';

import styled from 'styled-components';
import _orderBy from 'lodash/orderBy';

import Card from 'src/common/components/Card';
import Button from 'src/common/components/Button';
import { px } from 'src/styles';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import Table, { ColumnOptions, SortCallback } from 'src/common/components/Table';
import PlusIcon from 'src/assets/icons/plus.svg';
import DownloadIcon from 'src/assets/icons/download.svg';
import DocumentIcon from 'src/assets/icons/document.svg';
import * as dt from 'src/common/utils/datetime';
import { PAGINATION_LIMITS } from 'src/common/components/Pagination';
import { WithFilter, WithSort, useAppDispatch, useAppSelector } from 'src/modules/store';
import useDownloadSnackbar from 'src/common/utils/useDownloadSnackbar';
import {
  LabVisitItem,
  LabVisitListFilter,
  LabVisitListSort,
  useEditLabVisit,
  useLabVisitsList,
  useLabVisitParticipantSuggestions,
} from './labVisit.slice';
import VisitNoteModal from './VisitNoteModal';
import VisitEditorModal from './VisitEditorModal';
import { userNameSelector } from 'src/modules/auth/auth.slice';
import { executeDownloadFiles, getFileDownloadUrls } from 'src/modules/file-download/fileDownload';
import { isStudyResearcher } from '../auth/auth.slice.userRoleSelector';

const LAB_VISIT_CARD_MIN_HEIGHT = 528;

const LabVisitCard = styled(Card)`
  min-height: ${px(LAB_VISIT_CARD_MIN_HEIGHT)};
`;

const AddVisitButton = styled(Button)`
  margin-top: ${px(-8)};
  width: ${px(164)};
`;

const TableIconButton = styled(Button)`
  margin: ${px(-4)} 0;
  padding: 0;
  width: auto;
`;

const NotesButton = styled(TableIconButton)`
  margin-left: ${px(5)};
`;

const DownloadButton = styled(TableIconButton)`
  margin-left: ${px(21)};
`;

const EditButton = styled(Button)`
  margin-left: ${px(-6)};
`;

const LabVisitTable = styled(Table)`
  margin-top: ${px(10)};
` as typeof Table;

const renderStartEndTs = (ts: string) => dt.format(ts, 'LLL dd yyyy hh:mm a');

const useLabVisitModal = <T,>() => {
  const [columnToShowNote, setColumnToShowNote] = useState<T | undefined>();
  return {
    data: columnToShowNote,
    open: setColumnToShowNote,
    close: useCallback(() => setColumnToShowNote(undefined), []),
  };
};

type DefaultPaginationProps = WithSort<LabVisitListSort> & WithFilter<LabVisitListFilter>;

const defaultFetchArgs: DefaultPaginationProps = {
  filter: { page: 0, size: PAGINATION_LIMITS[0] },
  sort: { column: 'startTime', direction: 'desc' },
};

const DownloadRowDocuments: React.FC<{ row: LabVisitItem; studyId?: string }> = ({
  row,
  studyId,
}) => {
  const dispatch = useAppDispatch()

  const handleDownloadFiles = useDownloadSnackbar(async () => {
    if (!studyId || !row.filePaths?.length) return;
    const filePaths = row.filePaths;
    const urls = await dispatch(getFileDownloadUrls(studyId, filePaths));
    urls.forEach((url, index) => {
      if (!!url)
        executeDownloadFiles(url, filePaths[index]);
    });
  });

  return row.filePaths?.length ? (
    <DownloadButton
      data-testid="download-documents-button"
      rate="x-small"
      fill="text"
      onClick={handleDownloadFiles}
      icon={<DownloadIcon />}
    />
  ) : null;
};

const LabVisit = () => {
  const studyId = useSelectedStudyId();
  const noteModal = useLabVisitModal<LabVisitItem>();
  const editorModal = useLabVisitModal<Partial<LabVisitItem>>();
  const isResearcher = isStudyResearcher();

  const userName = useAppSelector(userNameSelector);
  const { isEditble } = useEditLabVisit();

  const [sort, setSort] = useState<LabVisitListSort>(defaultFetchArgs.sort);
  const [filter, setFilter] = useState<LabVisitListFilter>(defaultFetchArgs.filter);

  const columns: ColumnOptions<LabVisitItem>[] = useMemo(
    () => [
      {
        dataKey: 'subjectNumber',
        label: 'Subject number',
        $width: 149,
        render: (_, row) => row.subjectNumber,
      },
      {
        dataKey: 'startTime',
        label: 'Visit Start',
        $width: 169,
        render: (startTs) => renderStartEndTs(startTs as string),
      },
      {
        dataKey: 'endTime',
        label: 'Visit End',
        $width: 169,
        render: (endTs) => renderStartEndTs(endTs as string),
      },
      {
        dataKey: 'picId',
        label: 'PIC',
        $width: 149,
      },
      {
        dataKey: 'note',
        label: 'Note',
        $width: 83,
        ellipsis: false,
        disableSort: true,
        render: (note, row) =>
          note ? (
            <NotesButton
              data-testid="show-notes-button"
              rate="x-small"
              fill="text"
              onClick={() => noteModal.open(row)}
              icon={<DocumentIcon />}
            />
          ) : (
            ''
          ),
      },
      {
        dataKey: 'filePaths',
        label: 'Documents',
        $width: 116,
        ellipsis: false,
        disableSort: true,
        render: (_, row) => <DownloadRowDocuments row={row} studyId={studyId} />,
      },
      {
        dataKey: 'id',
        $width: 53,
        ellipsis: false,
        render: (_, row) =>
          !isResearcher && (
            <EditButton
              data-testid="edit-visit-button"
              rate="x-small"
              fill="text"
              disabled={!isEditble}
              onClick={() => editorModal.open(row)}
            >
              EDIT
            </EditButton>
          ),
      },
    ],
    [editorModal, noteModal, studyId, isEditble]
  );

  const {
    data: rawParticipantSuggestions
  } = useLabVisitParticipantSuggestions({
    fetchArgs: studyId ? { studyId } : false,
  });

  const participantSuggestions: Record<string, string> = useMemo(
    () => (rawParticipantSuggestions ?? []).reduce((accumulator, { subjectNumber }) => ({ ...accumulator, [subjectNumber]: subjectNumber }), {}),
    [rawParticipantSuggestions]
  );

  const {
    isLoading: isLabVisitsLoading,
    data: originalData,
    error,
    fetchArgs,
    prevFetchArgs,
    refetch: refetchVisitsList,
  } = useLabVisitsList({
    fetchArgs: studyId ? { studyId, sort, filter } : false,
    refetchSilentlyOnMount: true,
  });

  const computedData = useMemo(() => {
    const list = (originalData?.list ?? [])
      .map((i) => ({
        ...i,
        participantEmail: participantSuggestions[i.subjectNumber] || 'unknown',
        isProcessing: false,
      }));

    return { ...originalData, list };
  }, [originalData, participantSuggestions]);

  const isStudySwitching = useMemo(
    () => !_isEqual(prevFetchArgs?.studyId, fetchArgs?.studyId),
    [fetchArgs?.studyId, prevFetchArgs?.studyId]
  );

  const isEmpty = !computedData.list.length;

  const onSortChange: SortCallback<LabVisitItem> = useCallback((sortings) => {
    const { column, direction } = sortings[0];
    setSort({ column, direction });
  }, []);

  const onPageChange = useCallback((offset: number, size: number, page: number) => {
    setFilter({ page, size });
  }, []);

  const handleEdit = useCallback(
    (i: LabVisitItem) => {
      noteModal.close();
      editorModal.open(i);
    },
    [editorModal, noteModal]
  );

  return (
    <>
      <LabVisitCard
        loading={(isEmpty && isLabVisitsLoading) || isStudySwitching}
        empty={!isLabVisitsLoading && isEmpty}
        error={!isLabVisitsLoading && !!error}
        onReload={refetchVisitsList}
        title="In-lab Visit"
        action={
          !isResearcher && (
            <AddVisitButton
              data-testid="add-visit-button"
              fill="bordered"
              rate="small"
              icon={<PlusIcon />}
              onClick={() => editorModal.open({ picId: userName })}
            >
              Add in-lab visit
            </AddVisitButton>
          )
        }
      >
        <LabVisitTable
          stickyHeader
          stickyFooter
          columns={columns}
          rows={computedData.list}
          getRowKey={(i) => i.id}
          isLoading={isLabVisitsLoading}
          virtual={computedData.list.length > PAGINATION_LIMITS[0]}
          sort={{
            sortings: [sort],
            onSortChange,
          }}
          pagination={{
            pageNumber: filter.page,
            pageSize: filter.size,
            totalCount: computedData.totalCount ?? 0,
            onPageChange,
          }}
        />
      </LabVisitCard>
      <VisitNoteModal data={noteModal.data} onRequestClose={noteModal.close} onEdit={handleEdit} />
      <VisitEditorModal
        data={editorModal.data}
        onSaved={refetchVisitsList}
        onRequestClose={editorModal.close}
      />
    </>
  );
};

export default LabVisit;
