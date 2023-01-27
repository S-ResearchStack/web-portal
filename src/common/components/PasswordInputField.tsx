import React, { useMemo, useState } from 'react';
import { SpecColorType } from 'src/styles/theme';

import styled from 'styled-components';

import Visibility from 'src/assets/icons/visibility.svg';
import VisibilityOff from 'src/assets/icons/visibility_off.svg';
import browser from 'src/common/utils/browser';
import IconButton from 'src/common/components/IconButton';
import InputField, { InputFieldProps, RIGHT_PADDING } from 'src/common/components/InputField';
import { px } from 'src/styles';

const ICON_BUTTON_WIDTH = 24;

const StyledEndExtraButton = styled(IconButton)`
  position: relative;
  bottom: ${browser.isSafari ? px(43) : px(41)};
  left: calc(100% - ${px(ICON_BUTTON_WIDTH + RIGHT_PADDING)});

  :hover {
    cursor: pointer;
  }
`;

type EndExtraProps = {
  selected: boolean;
  onClick: () => void;
  color: SpecColorType;
  disabled?: boolean;
};

export const EndExtra = ({ selected, onClick, color, disabled }: EndExtraProps) => (
  <StyledEndExtraButton
    selected={selected}
    onClick={onClick}
    icon={selected ? VisibilityOff : Visibility}
    $size="s"
    color={color}
    disabled={disabled}
    aria-label={selected ? 'Hide Password' : 'Show Password'}
  />
);

const PasswordInputField = ({
  label,
  helperText,
  error,
  disabled,
  ...rest
}: Omit<InputFieldProps, 'type' | 'endExtra'>): JSX.Element => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const toggleChecked = () => setIsPasswordVisible(!isPasswordVisible);

  const endExtraColor = useMemo(() => {
    let color = 'primary';
    if (error) {
      color = 'statusErrorText';
    } else if (disabled) {
      color = 'disabled';
    } else if (isPasswordVisible) {
      color = 'textSecondaryGray';
    }
    return color as SpecColorType;
  }, [error, disabled, isPasswordVisible]);

  return (
    <InputField
      type={isPasswordVisible ? 'text' : 'password'}
      endExtra={{
        component: (
          <EndExtra
            selected={isPasswordVisible}
            onClick={toggleChecked}
            color={endExtraColor}
            disabled={disabled}
          />
        ),
        extraWidth: ICON_BUTTON_WIDTH,
      }}
      label={label}
      helperText={helperText}
      error={error}
      disabled={disabled}
      {...rest}
    />
  );
};

export default PasswordInputField;
