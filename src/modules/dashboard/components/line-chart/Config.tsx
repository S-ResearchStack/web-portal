import React from 'react';
import ChooseColumn from '../base/ChooseColumn';
import Toggle from 'src/common/components/Toggle';
import { LineChartConfig, QueryResponseColumn } from 'src/modules/api';

const Config = ({ columns, config, onChange }: { columns?: QueryResponseColumn[]; config?: LineChartConfig, onChange: (config: Partial<LineChartConfig>) => void }) => {
  const onCategoryChange = (category: string) => {
    onChange({ category });
  };
  const onValueChange = (value: string) => {
    onChange({ value, isSmooth: config?.isSmooth || false });
  };
  const onSmoothChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ isSmooth: evt.target.checked });
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
        data-testid='toggle-smooth'
        label="Smooth"
        checked={config?.isSmooth || false}
        onChange={onSmoothChange}
      />
    </div>
  );
};

export default Config;
