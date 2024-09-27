import React, { FormEvent } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Label, { LabelProps } from './Label';
import { StyledTextField } from 'src/common/components/InputField';
import LimitsCounter from './LimitCounter';

interface EnterTextProps extends LabelProps {
  label: string;
  value?: string;
  maxLength?: number;
  onChange: (value: string) => void;
}

const EnterText = ({ label, maxLength, value = '', onChange, ...props }: EnterTextProps) => {
  const onChangeValue = (evt: FormEvent<HTMLInputElement>) => {
    const { value } = evt.target as HTMLInputElement;
    onChange(value);
  };

  return (
    <Container>
      <Label required {...props}>{label}</Label>
      {maxLength ? (
        <LimitsCounter inner current={value.length} max={maxLength}>
          <StyledTextField data-testid='title-input' maxLength={maxLength} value={value} onChange={onChangeValue} error={!value.length}/>
        </LimitsCounter>
      ) : (
        <StyledTextField data-testid='title-input' maxLength={maxLength} value={value} onChange={onChangeValue} error={!value.length}/>
      )}
    </Container>
  );
};

export default EnterText;

const Container = styled.div`
  margin-bottom: ${px(12)};
`;
