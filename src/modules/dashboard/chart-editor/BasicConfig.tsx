import React from 'react';
import styled from 'styled-components';

import EnterText from '../components/base/EnterText';
import ChooseType from '../components/base/ChooseType';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import type { ChartConfigBasic, ChartType } from 'src/modules/api';

type ChartConfigProps = {
  loading?: boolean;
  errors?: { type: { empty?: boolean } };
  configBasic?: Partial<ChartConfigBasic>;
  onChange: (config: Partial<ChartConfigBasic>) => void;
};

const BasicConfig = ({ loading, errors, configBasic, onChange }: ChartConfigProps) => {
  const onChangeTitle = (name: string) => {
    onChange({ ...configBasic, name });
  };
  const onChangeType = (type: ChartType) => {
    onChange({ ...configBasic, type });
  };

  if (loading)
    return (
      <>
        <SkeletonsWrapper>
          <SkeletonRect key="top" x="0" y="5" rx="2" width="80" height="18" />
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="56" />
        </SkeletonsWrapper>
        <SkeletonsWrapper>
          <SkeletonRect key="top" x="0" y="5" rx="2" width="80" height="18" />
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="66" />
        </SkeletonsWrapper>
      </>
    )

  return (
    <>
      <EnterText
        required
        label="Chart title"
        maxLength={50}
        value={configBasic?.name}
        onChange={onChangeTitle}
      />

      <ChooseType
        error={errors?.type.empty}
        value={configBasic?.type}
        onChange={onChangeType}
      />
    </>
  )
};

export default BasicConfig;

const SkeletonsWrapper = styled(SkeletonLoading)`
  width: 100%;
`;
