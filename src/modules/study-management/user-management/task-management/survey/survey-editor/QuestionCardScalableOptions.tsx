import React, { FC } from 'react';

import _range from 'lodash/range';
import styled from 'styled-components';

import Dropdown, { DropdownItem } from 'src/common/components/Dropdown';
import { InputFieldProps, StyledTextField } from 'src/common/components/InputField';
import { colors, px, typography } from 'src/styles';
import { desktopMq, laptopMq } from 'src/common/components/SimpleGrid';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import type { ScalableAnswer } from './surveyEditor.slice';

const OptionsContainer = styled.div<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${px(16)};
  padding: ${px(10)} ${px(0)} ${px(8)};

  @media screen and ${laptopMq.media} {
    padding-left: ${(p) => px(p.compact ? 16 : 8)};
    margin-bottom: ${(p) => px(p.compact ? 46 : 0)};
  }

  @media screen and ${desktopMq.media} {
    padding: ${px(10)} ${px(0)} ${px(8)};
  }
`;

const OptionSection = styled.div`
  display: grid;
  align-items: center;
  gap: ${px(16)};
`;

const OptionContainer = styled.div<{ compact?: boolean }>`
  display: flex;
  gap: ${px(32)};

  @media screen and ${laptopMq.media} {
    gap: ${(p) => px(p.compact ? 16 : 32)};
  }

  @media screen and ${desktopMq.media} {
    gap: ${px(32)};
  }

  > ${OptionSection}:first-child {
    grid-template-columns: ${px(120)} ${px(92)};

    @media screen and ${laptopMq.media} {
      grid-template-columns: ${(p) => px(p.compact ? 72 : 120)} ${px(92)};
    }

    @media screen and ${desktopMq.media} {
      grid-template-columns: ${px(120)} ${px(92)};
    }
  }

  > ${OptionSection}:last-child {
    grid-template-columns: ${px(36)} ${px(226)};
  }
`;

const Label = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
`;

const LabelTextField = withLocalDebouncedState<HTMLInputElement, InputFieldProps>(StyledTextField);

interface QuestionCardSelectableOptionsProps {
  data: ScalableAnswer[];
  onChange: (data: ScalableAnswer[]) => void;
  compact?: boolean;
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
  compact?: boolean;
}

const Option: FC<OptionProps> = ({
  title,
  label,
  values,
  value,
  onChangeValue,
  onChangeLabel,
  compact,
}) => (
  <OptionContainer compact={compact}>
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
      <LabelTextField
        value={label}
        onChange={(evt) => onChangeLabel(evt.target.value)}
        maxLength={20}
      />
    </OptionSection>
  </OptionContainer>
);

const QuestionCardScalableOptions: FC<QuestionCardSelectableOptionsProps> = ({
  data,
  onChange,
  compact,
}) => {
  const [min, max] = data;

  return (
    <OptionsContainer compact={compact}>
      <Option
        compact={compact}
        title="Minimum number"
        label={min?.label}
        values={[0, 1]}
        value={min?.value}
        onChangeValue={(value) => onChange([{ ...min, value }, max])}
        onChangeLabel={(label) => onChange([{ ...min, label }, max])}
      />
      <Option
        compact={compact}
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
