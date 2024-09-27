import React from 'react';
import { ChartConfigBasic, ChartConfigSpecific, QueryResponse } from 'src/modules/api';
import ChartView from '../components/ChartView';
import ChartCardWithSkeleton from 'src/common/components/ChartCardWithSkeleton';

type ChartPreviewProps = {
  loading?: boolean;
  sourceResult?: QueryResponse;
  configBasic?: Partial<ChartConfigBasic>;
  configSpecific?: Partial<ChartConfigSpecific>;
  onValidateChange: (error?: string) => void;
};
const ChartPreview = ({ loading, ...props }: ChartPreviewProps) => {
  if (loading)
    return <ChartCardWithSkeleton cardNumber={1} />;

  return <ChartView {...props} />
    ;
};

export default ChartPreview;
