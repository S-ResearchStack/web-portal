import React from 'react';
import styled from 'styled-components';
import { colors } from 'src/styles';
import { SubjectRow } from '../SubjectManagement/SubjectManagement';

const UndoneTaskContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const UndoneTask = styled.div`
  margin: 0;
  min-width: 0;
  text-transform: none;
  color: ${colors.primary};
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

export interface SubjectTaskProgressProps {
  value: any;
  onSelected?: (subject: SubjectRow) => void;
}

const SubjectTaskProgress = ({ value, onSelected }: SubjectTaskProgressProps) => {
  const handleClickName = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelected?.(value);
  };

  const doneCount = value.totalCount - (value.undoneTaskList?.length ?? 0);

  return (
    <UndoneTaskContainer>
      <UndoneTask onClick={handleClickName} data-testid="undone-task-label">
        {doneCount} / {value.totalCount}
      </UndoneTask>
    </UndoneTaskContainer>
  );
};

export default SubjectTaskProgress;
