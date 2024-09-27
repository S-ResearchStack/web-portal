import React from 'react';
import ChooseColumn from '../base/ChooseColumn';
import { BarChartConfig, QueryResponseColumn } from 'src/modules/api';
import Toggle from 'src/common/components/Toggle';

const Config = ({ columns, config, onChange }: { columns?: QueryResponseColumn[]; config?: BarChartConfig, onChange: (config: Partial<BarChartConfig>) => void }) => {
  const onCategoryChange = (category: string) => {
    onChange({ category });
  };
  const onValueChange = (value: string) => {
    onChange({ value, isHorizontal: config?.isHorizontal || false });
  };
  const onHorizontalChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ isHorizontal: evt.target.checked });
  };

  return (
    <div>
      <ChooseColumn
        required
        label='Value column'
        filterTypes={['number']}
        columns={columns}
        value={config?.value}
        onChange={onValueChange}
      />
      <ChooseColumn
        required
        label='Category column'
        columns={columns}
        value={config?.category}
        onChange={onCategoryChange}
      />
      <Toggle
        data-testid='toggle-horizontal'
        label="Horizontal"
        checked={config?.isHorizontal}
        onChange={onHorizontalChange}
      />
    </div>
  );
};

export default Config;
