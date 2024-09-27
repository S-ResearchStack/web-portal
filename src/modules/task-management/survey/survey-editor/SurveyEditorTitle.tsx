import React, { ChangeEvent, FC } from 'react';

import styled, { css } from 'styled-components';

import { colors, px, typography } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { InputFieldProps, StyledTextField } from 'src/common/components/InputField';
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
  $pressLeft: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const EditorTitleDescriptionTextField = withLocalDebouncedState<
  HTMLInputElement,
  EditorTitleDescriptionTextFieldProps
>(styled.input<EditorTitleDescriptionTextFieldProps>`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
  border: none;
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
    color: ${colors.textSecondaryGray};
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
  title: string;
  description: string;
  onChangeTitle?: EditorTitleChangeListener;
  onChangeDescription: EditorTitleChangeListener;
  error?: boolean;
  loading?: boolean;
  descriptionPlaceholder: string;
  titleTooltip?: React.ReactNode;
  disableInput?: boolean;
  maxDescriptionLength?: number;
}

const MAX_TITLE_LENGTH = 90;
const MAX_DESCRIPTION_LENGTH = 120;
export const SURVEY_TITLE_DATA_ID = 'survey-title';

const SurveyEditorTitle: FC<EditorTitleProps> = ({
  title,
  description,
  onChangeTitle,
  onChangeDescription,
  error,
  loading,
  descriptionPlaceholder,
  titleTooltip,
  disableInput,
  maxDescriptionLength,
}) => (
  <EditorTitleContainer>
    {loading && <EditorTitleLoading pressLeft={!onChangeTitle} />}
    {onChangeTitle ? (
      <LimitsCounter current={title.length} max={MAX_TITLE_LENGTH} error={error}>
        <EditorTitleTextField
          lighten
          type="text"
          label="Title"
          data-id={SURVEY_TITLE_DATA_ID}
          max={MAX_TITLE_LENGTH}
          value={title}
          error={error}
          disabled={loading || disableInput}
          placeholder={!loading ? 'Enter survey title*' : ''}
          onChange={onChangeTitle}
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
    >
      <EditorTitleDescriptionTextField
        type="text"
        placeholder={!loading ? descriptionPlaceholder : ''}
        value={description}
        onChange={onChangeDescription}
        disabled={loading || disableInput}
        $pressLeft={!onChangeTitle}
        aria-label="Survey Description"
        max={maxDescriptionLength || MAX_DESCRIPTION_LENGTH}
      />
    </LimitsCounter>
  </EditorTitleContainer>
);

export default SurveyEditorTitle;