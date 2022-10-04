import _range from 'lodash/range';
import React, { FC } from 'react';
import styled from 'styled-components';

import Dropdown, { DropdownItem } from 'src/common/components/Dropdown';
import { StyledTextField } from 'src/common/components/InputField';
import { ScalableAnswer } from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import { colors, px, typography } from 'src/styles';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(16)};
  padding: ${px(10)} ${px(8)} ${px(8)};
`;

const OptionSection = styled.div`
  display: grid;
  align-items: center;
  gap: ${px(16)};
`;

const OptionContainer = styled.div`
  display: flex;
  gap: ${px(32)};

  > ${OptionSection}:first-child {
    grid-template-columns: ${px(120)} ${px(92)};
  }

  > ${OptionSection}:last-child {
    grid-template-columns: ${px(36)} ${px(226)};
  }
`;

const Label = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.updTextPrimary};
`;

interface QuestionCardSelectableOptionsProps {
  data: ScalableAnswer[];
  onChange: (data: ScalableAnswer[]) => void;
}

const getDropdownItemsFromRange = (range: [number, number]): DropdownItem<number>[] =>
  _range(range[0], range[1] + 1).map((v) => ({ label: String(v), key: v }));

interface OptionProps {
  title: string;
  label: string;
  values: [number, number];
  value: number;
  onChangeValue: (value: number) => void;
  onChangeLabel: (label: string) => void;
}

const Option: FC<OptionProps> = ({ title, label, values, value, onChangeValue, onChangeLabel }) => (
  <OptionContainer>
    <OptionSection>
      <Label>{title}</Label>
      <Dropdown
        items={getDropdownItemsFromRange(values)}
        activeKey={value}
        onChange={onChangeValue}
      />
    </OptionSection>
    <OptionSection>
      <Label>Label</Label>
      <StyledTextField value={label} onChange={(evt) => onChangeLabel(evt.target.value)} />
    </OptionSection>
  </OptionContainer>
);

const QuestionCardScalableOptions: FC<QuestionCardSelectableOptionsProps> = ({
  data,
  onChange,
}) => {
  const [min, max] = data;

  return (
    <OptionsContainer>
      <Option
        title="Minimum number"
        label={min?.label}
        values={[0, 1]}
        value={min?.value}
        onChangeValue={(value) => onChange([{ ...min, value }, max])}
        onChangeLabel={(label) => onChange([{ ...min, label }, max])}
      />
      <Option
        title="Maximum number"
        label={max?.label}
        values={[2, 10]}
        value={max?.value}
        onChangeValue={(value) => onChange([min, { ...max, value }])}
        onChangeLabel={(label) => onChange([min, { ...max, label }])}
      />
    </OptionsContainer>
  );
};

export default QuestionCardScalableOptions;
