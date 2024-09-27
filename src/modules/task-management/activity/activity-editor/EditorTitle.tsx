import React, { ChangeEvent, FC } from 'react';

import styled, { css } from 'styled-components';

import { colors, px, typography } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import InputField, { InputFieldProps, StyledTextField } from 'src/common/components/InputField';
import Tooltip from 'src/common/components/Tooltip';
import InfoIcon from 'src/assets/icons/info.svg';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import LimitsCounter from 'src/modules/common/LimitsCounter';

const EditorTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(4)};
  margin-bottom: ${px(37)};
  position: relative;
  padding-top: ${px(36)};
`;

const commonTitleStyles = css`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
  height: ${px(52)};
  margin: 0;
`;

const EditorTitleTextField = withLocalDebouncedState<HTMLInputElement, InputFieldProps>(styled(
  StyledTextField
)`
  ${commonTitleStyles};

  &:disabled {
    background-color: ${colors.surface} !important;
    color: ${colors.textPrimary} !important;
  }

  &::placeholder {
    color: ${({ theme, error }) => error && theme.colors.statusErrorText};
  }
`);

type EditorTitleDescriptionTextFieldProps = {
  error?: boolean;
  $pressLeft: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const EditorTitleDescriptionTextField = withLocalDebouncedState<
  HTMLInputElement,
  EditorTitleDescriptionTextFieldProps
>(styled.input<EditorTitleDescriptionTextFieldProps>`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
  border: ${({ error }) => (error ? colors.surface : 'none')};
  outline: none;
  background: transparent;
  display: block;
  width: 100%;
  padding: 0;
  padding-right: ${px(16)};
  padding-left: ${(p) => px(p.$pressLeft ? 0 : 16)};
  margin: 0;
  height: ${px(24)};

  &::placeholder {
    color: ${({ error }) => (error ? colors.statusErrorText : colors.textSecondaryGray)};
  }
`);

type EditorTitleLoadingProps = {
  pressLeft?: boolean;
};

const EditorTitleLoadingContainer = styled(SkeletonLoading) <{ $pressLeft?: boolean }>`
  position: absolute;
  z-index: 1;
  top: ${px(55)};
  left: ${(p) => px(p.$pressLeft ? 0 : 16)};
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.div`
  ${commonTitleStyles};
  display: flex;
  align-items: center;
`;

const StyledTooltip = styled(Tooltip)`
  white-space: pre;
`;

const InfoIconStyled = styled(InfoIcon)`
  margin-top: ${px(3)};
  margin-left: ${px(8)};
  display: block;
  width: ${px(16)};
  height: ${px(16)};
`;

const EditorTitleLoading = ({ pressLeft }: EditorTitleLoadingProps) => (
  <EditorTitleLoadingContainer $pressLeft={pressLeft}>
    <SkeletonRect x={0} y={0} width={460} height={16} />
    <SkeletonRect x={0} y={44} width={258} height={12} />
  </EditorTitleLoadingContainer>
);

type EditorTitleChangeListener = (evt: ChangeEvent<HTMLInputElement>) => void;

interface EditorTitleProps {
  id?: string;//required but dont want to update Activity now
  title: string;
  description: string;
  onChangeId?: EditorTitleChangeListener;
  onChangeTitle?: EditorTitleChangeListener;
  onChangeDescription: EditorTitleChangeListener;
  errorId?: boolean;
  errorTitle?: boolean;
  errorDescription?: boolean;
  loading?: boolean;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  idTooltip?: React.ReactNode;
  titleTooltip?: React.ReactNode;
  disableInput?: boolean;
  maxDescriptionLength?: number;
}

const MAX_TITLE_LENGTH = 90;
const MAX_DESCRIPTION_LENGTH = 120;

const EditorTitle: FC<EditorTitleProps> = ({
  id,
  title,
  description,
  onChangeId,
  onChangeTitle,
  onChangeDescription,
  errorId,
  errorTitle,
  errorDescription,
  loading,
  titlePlaceholder = 'Title',
  descriptionPlaceholder = 'Description',
  idTooltip,
  titleTooltip,
  disableInput,
  maxDescriptionLength,
}) => (
  <EditorTitleContainer>
    {loading && <EditorTitleLoading pressLeft={!onChangeTitle} />}
    {onChangeId ? (
      <LimitsCounter current={title.length} max={MAX_TITLE_LENGTH} error={errorId}>
        <InputField
          lighten
          type="text"
          label="ID"
          aria-label="ID"
          data-id='activity-id'
          placeholder={!loading ? 'Enter id*' : ''}
          value={id}
          onChange={onChangeId}
          error={errorId}
          disabled={loading || disableInput}
          max={MAX_TITLE_LENGTH}
        />
      </LimitsCounter>
    ) : id ? (
      <TitleContainer>
        <Title>{id}</Title>
        {!loading && idTooltip && (
          <StyledTooltip content={idTooltip} position="r" trigger="hover" arrow>
            <InfoIconStyled />
          </StyledTooltip>
        )}
      </TitleContainer>
    ) : null}
    {onChangeTitle ? (
      <LimitsCounter current={title.length} max={MAX_TITLE_LENGTH} error={errorTitle}>
        <EditorTitleTextField
          lighten
          type="text"
          label="Title"
          data-id='activity-title'
          aria-label={titlePlaceholder}
          placeholder={!loading ? titlePlaceholder : ''}
          value={title}
          error={errorTitle}
          onChange={onChangeTitle}
          disabled={loading || disableInput}
          max={MAX_TITLE_LENGTH}
        />
      </LimitsCounter>
    ) : (
      <TitleContainer>
        <Title>{title}</Title>
        {!loading && titleTooltip && (
          <StyledTooltip content={titleTooltip} position="r" trigger="hover" arrow>
            <InfoIconStyled />
          </StyledTooltip>
        )}
      </TitleContainer>
    )}
    <LimitsCounter
      current={description.length}
      max={maxDescriptionLength || MAX_DESCRIPTION_LENGTH}
      error={errorDescription}
    >
      <EditorTitleDescriptionTextField
        type="text"
        data-id='activity-description'
        placeholder={!loading ? descriptionPlaceholder : ''}
        value={description}
        error={errorDescription}
        onChange={onChangeDescription}
        disabled={loading || disableInput}
        $pressLeft={!onChangeTitle}
        aria-label={descriptionPlaceholder}
        max={maxDescriptionLength || MAX_DESCRIPTION_LENGTH}
      />
    </LimitsCounter>
  </EditorTitleContainer>
);

export default EditorTitle;
