import React, { useMemo } from 'react';
import styled from 'styled-components';

import { colors, px } from 'src/styles';
import Label from '../components/base/Label';
import ListView from '../components/base/ListView';
import Dropdown from 'src/common/components/Dropdown';
import { useDatabaseList, useTableList } from './sourceModal.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

type QueryEditorProps = {
  database: string;
  onChangeDatabase: (value: string) => void;
};

const QuerySelectorViewer = ({ database, onChangeDatabase }: QueryEditorProps) => {
  const studyId = useSelectedStudyId();
  const { data: databaseList = [], isLoading: dbLoading } = useDatabaseList({
    fetchArgs: !!studyId && { studyId },
  });
  const { data: tableList = [], isLoading: tableLoading } = useTableList({
    fetchArgs: !!studyId && database ? { studyId, database: database } : false,
  });

  const databaseItems = useMemo(
    () => (databaseList || []).map((db) => ({ label: db, key: db })),
    [databaseList]
  );

  const handleChangeDatabase = (db: string) => {
    if (db) onChangeDatabase(db);
  };

  return (
    <QuerySelectorContainer>
      <DatabaseContainer>
        <Label>Database</Label>
        <Dropdown
          data-testid="database-dropdown"
          loading={dbLoading}
          activeKey={database}
          items={databaseItems}
          onChange={handleChangeDatabase}
          placeholder='Select Database'
        />
      </DatabaseContainer>
      {database &&
        <ListView data-testid="table-list" label="Table" items={tableList} loading={tableLoading} />
      }

    </QuerySelectorContainer>
  );
};

export default QuerySelectorViewer;

const QuerySelectorContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: ${px(16)};
  border: solid ${px(1)} ${colors.black08};
  border-radius: ${px(4)};
`;

const DatabaseContainer = styled.div`
  margin-bottom: ${px(12)};
`;
