import React, { useEffect, useState } from 'react';
import StudyDataTitle from 'src/common/components/StudyDataTitle';
import { Grid } from '@mui/material';
import styled from 'styled-components';
import { typography } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  loadSubjectInfoList,
  SubjectInfo,
  useSubjectInfoList,
  useTotalSubjectInfoList,
} from '../studyManagement.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import SubjectStatusSelector from '../SubjectStatusSelector/SubjectStatusSelector';
import SubjectTaskProgress from '../SubjectTaskProgress/SubjectTaskProgress';

const SubjectIdText = styled.div`
  ${typography.bodySmallRegular}
`;

export interface SubjectRow extends SubjectInfo {
  id: number;
}

interface SubjectManagementProps {
  onChangeSubjectStatus?: () => Promise<boolean>;
}

const SubjectManagement: React.FC<SubjectManagementProps> = () => {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 0 });
  const [rows, setRows] = useState<SubjectRow[]>([]);

  const studyId = useSelectedStudyId();
  const subjectInfoList = useSubjectInfoList();
  const totalSubjectInfoList = useTotalSubjectInfoList();

  useEffect(() => {
    const subjectRows: SubjectRow[] = subjectInfoList.map((subjectInfo, index) => ({
      ...subjectInfo,
      id: index,
      taskProgress: {
        totalCount: subjectInfo?.totalTaskCount ?? 0,
      },
      lastSyncTime: subjectInfo?.lastSyncTime ?? '-',
    }));
    setRows(subjectRows);
  }, [studyId, subjectInfoList]);

  const columns: GridColDef[] = [
    {
      field: 'subjectNumber',
      headerName: 'ID',
      headerClassName: 'header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => <SubjectIdText>{params.value}</SubjectIdText>,
    },
    {
      field: 'status',
      headerName: 'Status',
      headerClassName: 'header',
      headerAlign: 'center',
      align: 'center',
      flex: 8,
      renderCell: (params) => <SubjectStatusSelector subjectInfo={params.row as SubjectInfo} />,
    },
    {
      field: 'taskProgress',
      headerName: 'Task Progress (done / total)',
      headerClassName: 'header',
      headerAlign: 'center',
      align: 'center',
      flex: 2,
      renderCell: (params) => <SubjectTaskProgress value={params.value} />,
    },
    {
      field: 'lastSyncTime',
      headerName: 'Last Sync Time',
      headerClassName: 'header',
      headerAlign: 'center',
      align: 'center',
      flex: 2,
    },
  ];

  const handlePaginationModelChange = async (model: GridPaginationModel) => {
    if (
      (model.page !== paginationModel.page || model.pageSize !== paginationModel.pageSize) &&
      !isLoading &&
      studyId &&
      model.pageSize > 0
    ) {
      setIsLoading(true);
      await dispatch(loadSubjectInfoList({ studyId, page: model.page, size: model.pageSize }));
      setIsLoading(false);
      setPaginationModel(model);
    }
  };

  const gridHeight = 'calc(100vh - 272px)';

  return (
    <Grid container alignContent="flex-start" paddingLeft={1} paddingRight={1}>
      <Grid item xs={12}>
        <StudyDataTitle title="Subject Status" />
      </Grid>
      <Grid item marginTop={1} xs={12} height={gridHeight}>
        <DataGrid
          disableRowSelectionOnClick
          disableColumnSelector
          loading={isLoading}
          columns={columns}
          rows={rows}
          rowCount={totalSubjectInfoList}
          columnHeaderHeight={48}
          rowHeight={40}
          getCellClassName={(params) => params.field}
          localeText={{ noRowsLabel: '' }}
          autoPageSize
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          sx={{ borderColor: 'rgba(0, 0, 0, .08)' }}
        />
      </Grid>
    </Grid>
  );
};

export default SubjectManagement;
