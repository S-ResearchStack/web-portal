import React, { useMemo } from 'react';
import styled from 'styled-components';

import { px, colors } from 'src/styles';
import Label from '../components/base/Label';
import ListView from '../components/base/ListView';
import IconButton from 'src/common/components/IconButton';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import type { ChartSource, QueryResponse } from 'src/modules/api';

import Edit from 'src/assets/icons/edit.svg';

type SourceConfigProps = {
  loading?: boolean;
  source?: ChartSource;
  errors?: { empty?: boolean };
  sourceResult?: QueryResponse
  onChange: () => void;
};

const SourceConfig = ({ loading, errors, source, sourceResult, onChange }: SourceConfigProps) => {
  const listLabel = useMemo(() => `Column list ( ${sourceResult?.columns.length || 0} columns )`, [sourceResult]);
  const listItems = useMemo(() => sourceResult?.columns.map(c => c.name) || [], [sourceResult]);
  
  if (loading)
    return (
      <>
        <SkeletonsWrapper>
          <SkeletonRect key="top" x="0" y="5" rx="2" width="80" height="18" />
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="30" />
        </SkeletonsWrapper>

        <SkeletonsWrapper>
          <SkeletonRect key="top" x="0" y="5" rx="2" width="80" height="18" />
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="200" />
        </SkeletonsWrapper>
      </>
    )

  return (
    <>
      <Label required error={errors?.empty}>Chart source</Label>
      <Main onClick={onChange}>
        <SqlQuery empty={!source?.query}>{source?.query || 'N/A'}</SqlQuery>
        <IconButton data-testid='edit-query-button' icon={Edit} color='primaryBluePressed' />
      </Main>

      {!!listItems.length &&
        <ListView label={listLabel} items={listItems} />
      }
    </>
  )
};

export default SourceConfig;

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${px(12)};
  
  &:hover {
    cursor: pointer;
  }
`;
const SqlQuery = styled.div<{ empty: boolean }>`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${({ empty }) => empty ? colors.textDisabled : colors.textPrimary};
`;

const SkeletonsWrapper = styled(SkeletonLoading)`
  width: 100%;
`;
