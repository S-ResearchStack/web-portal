import React from 'react';
import styled from 'styled-components';

import { getConfigComponent } from '../components/component.utils';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import type { QueryResponse, ChartConfigBasic, ChartConfigSpecific } from 'src/modules/api';

type ChartConfigProps = {
  loading?: boolean;
  sourceResult?: QueryResponse
  configBasic?: Partial<ChartConfigBasic>
  configSpecific?: Partial<ChartConfigSpecific>
  onChange: (config: Partial<ChartConfigSpecific>) => void
}
const ChartConfig = ({ loading, sourceResult, configBasic, configSpecific, onChange }: ChartConfigProps) => {
  const onConfigChange = (config: Partial<ChartConfigSpecific>) => {
    onChange({
      ...configSpecific,
      ...config
    });
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
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="58" />
        </SkeletonsWrapper>
        <SkeletonsWrapper>
          <SkeletonRect key="top" x="0" y="5" rx="2" width="80" height="18" />
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="66" />
        </SkeletonsWrapper>
        <SkeletonsWrapper>
          <SkeletonRect key="top" x="0" y="5" rx="2" width="80" height="18" />
          <SkeletonRect key="middle" x="0" y="26" rx="2" width="100%" height="68" />
        </SkeletonsWrapper>
      </>
    )

  if (!configBasic || !configBasic.type)
    return null;

  const Component = getConfigComponent(configBasic.type);

  return (
    <Component
      data={sourceResult}
      config={configSpecific}
      onChange={onConfigChange}
    />
  )
};

export default ChartConfig;

const SkeletonsWrapper = styled(SkeletonLoading)`
  width: 100%;
`;
