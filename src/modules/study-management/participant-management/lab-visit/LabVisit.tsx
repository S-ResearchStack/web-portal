import React, { useCallback, useMemo, useState } from 'react';
import _isEqual from 'lodash/isEqual';
import { useSelector } from 'react-redux';

import styled from 'styled-components';
import _orderBy from 'lodash/orderBy';

import Card from 'src/common/components/Card';
import Button from 'src/common/components/Button';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { isDataScientist } from 'src/modules/auth/userRole';
import { px } from 'src/styles';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import Table, { ColumnOptions, SortCallback } from 'src/common/components/Table';
import PlusIcon from 'src/assets/icons/plus.svg';
import DownloadIcon from 'src/assets/icons/download.svg';
import DocumentIcon from 'src/assets/icons/document.svg';
import * as dt from 'src/common/utils/datetime';
import { PAGINATION_LIMITS, PaginationProps } from 'src/common/components/Pagination';
import { WithFilter, WithSort } from 'src/modules/store';
import { downloadAllObjects } from 'src/modules/object-storage/utils';
import useDownloadSnackbar from 'src/common/utils/useDownloadSnackbar';
import {
  LabVisitItem,
  LabVisitListFilter,
  LabVisitListSort,
  makeEmptyLabVisit,
  useLabVisitsList,
} from './labVisit.slice';
import VisitNoteModal from './VisitNoteModal';
import VisitEditorModal from './VisitEditorModal';

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

const renderStartEndTs = (ts: string) => dt.format(ts, 'LLL dd hh:mm a');

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
  filter: { offset: 0, perPage: PAGINATION_LIMITS[0] },
  sort: { column: 'participantId', direction: 'asc' },
};

const DownloadRowDocuments: React.FC<{ filePath: string; row: LabVisitItem; studyId?: string }> = ({
  filePath,
  row,
  studyId,
}) => {
  const handleDownloadFiles = useDownloadSnackbar(async () => {
    studyId &&
      filePath &&
      (await downloadAllObjects({
        studyId,
        path: filePath as string,
        fileName: `in-lab-visit-${row.visitId}.zip`,
      }));
  });

  return row.hasDocuments ? (
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
  const userRoles = useSelector(userRoleSelector)?.roles;
  const noteModal = useLabVisitModal<LabVisitItem>();
  const editorModal = useLabVisitModal<Partial<LabVisitItem>>();

  const isUserDataScientist = isDataScientist(userRoles);
  const isModuleEnabled = !isUserDataScientist;

  const columns: ColumnOptions<LabVisitItem>[] = useMemo(
    () => [
      {
        dataKey: 'participantId',
        label: 'Participant ID',
        $width: 159,
      },
      {
        dataKey: 'startTs',
        label: 'Visit Start',
        $width: 159,
        render: (startTs) => renderStartEndTs(startTs as string),
      },
      {
        dataKey: 'endTs',
        label: 'Visit End',
        $width: 159,
        render: (endTs) => renderStartEndTs(endTs as string),
      },
      {
        dataKey: 'checkInBy',
        label: 'Check-in by',
        $width: 159,
      },
      {
        dataKey: 'notes',
        label: 'Notes',
        $width: 83,
        ellipsis: false,
        render: (notes, row) =>
          notes ? (
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
        dataKey: 'filesPath',
        label: 'Documents',
        $width: 116,
        ellipsis: false,
        render: (filePath, row) => (
          <DownloadRowDocuments filePath={filePath as string} row={row} studyId={studyId} />
        ),
      },
      {
        dataKey: 'visitId',
        $width: 53,
        ellipsis: false,
        render: (_, row) => (
          <EditButton
            data-testid="edit-visit-button"
            rate="x-small"
            fill="text"
            onClick={() => editorModal.open(row)}
          >
            EDIT
          </EditButton>
        ),
      },
    ],
    [editorModal, noteModal, studyId]
  );

  const [sort, setSort] = useState<LabVisitListSort>(defaultFetchArgs.sort);
  const [filter, setFilter] = useState<LabVisitListFilter>(defaultFetchArgs.filter);

  const {
    isLoading: isLabVisitsLoading,
    error,
    data: originalData,
    refetch: refetchVisitsList,
    prevFetchArgs,
    fetchArgs,
  } = useLabVisitsList({
    fetchArgs: isModuleEnabled && studyId ? { projectId: studyId } : false,
    refetchSilentlyOnMount: true,
  });

  const computedData = useMemo(() => {
    const list = _orderBy(originalData?.list ?? [], [sort.column], [sort.direction])
      .slice(filter.offset, filter.offset + filter.perPage)
      .map((i) => ({
        ...i,
        isProcessing: false, // TODO: add logic
      }));

    return { list };
  }, [originalData, sort, filter]);

  const isStudySwitching = useMemo(
    () => !_isEqual(prevFetchArgs?.projectId, fetchArgs?.projectId),
    [fetchArgs?.projectId, prevFetchArgs?.projectId]
  );

  const isEmpty = !computedData.list.length;

  const onSortChange: SortCallback<LabVisitItem> = useCallback((sortings) => {
    const { column, direction } = sortings[0];
    setSort({ column, direction });
  }, []);

  const onPageChange: PaginationProps['onPageChange'] = useCallback((offset, perPage) => {
    setFilter({ perPage, offset });
  }, []);

  const handleEdit = useCallback(
    (i: LabVisitItem) => {
      noteModal.close();
      editorModal.open(i);
    },
    [editorModal, noteModal]
  );

  return !isModuleEnabled ? null : (
    <>
      <LabVisitCard
        loading={(isEmpty && isLabVisitsLoading) || isStudySwitching}
        empty={!isLabVisitsLoading && isEmpty}
        error={!isLabVisitsLoading && !!error}
        onReload={refetchVisitsList}
        title="In-lab Visit"
        action={
          <AddVisitButton
            data-testid="add-visit-button"
            fill="bordered"
            rate="small"
            icon={<PlusIcon />}
            onClick={() => editorModal.open({ ...makeEmptyLabVisit(), visitId: undefined })}
          >
            Add in-lab visit
          </AddVisitButton>
        }
      >
        <LabVisitTable
          stickyHeader
          stickyFooter
          columns={columns}
          virtual={computedData.list.length > PAGINATION_LIMITS[0]}
          getRowKey={(i) => i.visitId}
          rows={computedData.list}
          sort={{
            onSortChange,
            sortings: [sort],
          }}
          pagination={{
            pageSize: filter.perPage,
            offset: filter.offset,
            totalCount: originalData?.list.length ?? 0,
            onPageChange,
          }}
        />
      </LabVisitCard>
      <VisitNoteModal data={noteModal.data} onRequestClose={noteModal.close} onEdit={handleEdit} />
      <VisitEditorModal
        data={editorModal.data}
        onRequestClose={editorModal.close}
        onSaved={refetchVisitsList}
      />
    </>
  );
};

export default LabVisit;
