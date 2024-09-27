import React from 'react';
import ChooseColumn from '../base/ChooseColumn';
import ChooseColor from '../base/ChooseColor';
import type { PieChartConfig, QueryResponseColumn } from 'src/modules/api';

const Config = ({ columns, config, onChange }: { columns?: QueryResponseColumn[]; config?: PieChartConfig, onChange: (config: Partial<PieChartConfig>) => void }) => {
  const onCategoryChange = (category: string) => {
    onChange({ category });
  };
  const onValueChange = (value: string) => {
    onChange({ value, color: config?.color || '' });
  };
  const onColorChange = (color: string) => {
    if (!color) onChange({ color: undefined });
    onChange({ color });
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
      <ChooseColor
        value={config?.color}
        onChange={onColorChange}
      />
    </div>
  );
};

export default Config;
