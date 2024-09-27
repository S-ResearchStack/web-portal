import React, { ChangeEvent, useCallback } from 'react';
import styled, { css } from 'styled-components';

import { colors, px, typography } from 'src/styles';
import { InputFieldProps, StyledTextField } from 'src/common/components/InputField';
import { EducationalContentType } from 'src/modules/api';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import LimitsCounter from 'src/modules/common/LimitsCounter';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import EducationAttachment from './EducationAttachment';
import { EducationEditorErrors } from './educationEditor.slice';
import { EducationItem } from './educationEditor.slice';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${px(32)};
  position: relative;
`;

const Container = styled(Section)`
  margin-top: ${px(36)};
  margin-bottom: ${px(36)};
`;

const commonTitleStyles = css`
  color: ${colors.textPrimary};
  height: ${px(52)};
  margin: 0;
`;

const TitleTextField = withLocalDebouncedState<HTMLInputElement, InputFieldProps>(styled(
  StyledTextField
)`
  ${typography.headingMedium};
  ${commonTitleStyles};

  &::placeholder {
    color: ${({ theme, error }) => error && theme.colors.statusErrorText};
  }

  &:disabled {
    background-color: ${colors.surface} !important;
    color: ${colors.textPrimary} !important;
  }
`);

const CategoryTextField = withLocalDebouncedState<HTMLInputElement, InputFieldProps>(styled(
  TitleTextField
)`
  ${typography.bodyMediumRegular};
`);

const LoadingContainer = styled.div`
  position: absolute;
  z-index: 1;
  padding: 0 ${px(16)};
`;

const Loading = () => (
  <LoadingContainer>
    <SkeletonLoading responsive>
      <SkeletonRect x={0} y={19} width={120} height={16} />
      <SkeletonRect x={0} y={103} width={678} height={16} />
    </SkeletonLoading>
  </LoadingContainer>
);

const MAX_TITLE_LENGTH = 50;
const MAX_CATEGORY_LENGTH = 25;

type EducationHeadEditorProps = {
  type: EducationalContentType;
  title: string;
  category: string;
  loading?: boolean;
  onChange: (education: Partial<EducationItem>) => void;
  attachment?: string;
  errors?: EducationEditorErrors;
  disableInput?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EducationHeadEditor = ({
  type,
  title,
  category,
  loading,
  onChange,
  attachment,
  errors,
  disableInput,
}: EducationHeadEditorProps) => {
  const handleTitleChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => onChange({ title: evt.target.value }),
    [onChange]
  );

  const handleCategoryChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => onChange({ category: evt.target.value }),
    [onChange]
  );

  const handleAttachmentChange = useCallback(
    (a: string) => {
      onChange({ attachment: { url: a, path: '' } });
    },
    [onChange]
  );

  return (
    <Container>
      <EducationAttachment
        loading={loading}
        type={type}
        attachment={attachment}
        onChange={handleAttachmentChange}
        error={!!errors?.attachment.empty}
        disableInput={disableInput}
      />
      <Section>
        {loading && <Loading />}
        <LimitsCounter
          current={category.length}
          max={MAX_CATEGORY_LENGTH}
          error={!!errors?.category.empty}
        >
          <CategoryTextField
            lighten
            type="text"
            value={category}
            onChange={handleCategoryChange}
            max={MAX_CATEGORY_LENGTH}
            placeholder={!loading ? 'Enter category*' : undefined}
            error={!!errors?.category.empty}
            data-testid="publication-category"
            disabled={disableInput}
          />
        </LimitsCounter>
        <LimitsCounter
          current={title.length}
          max={MAX_TITLE_LENGTH}
          error={!!errors?.title.empty}
        >
          <TitleTextField
            lighten
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder={!loading ? 'Enter title*' : undefined}
            error={!!errors?.title.empty}
            max={MAX_TITLE_LENGTH}
            disabled={disableInput}
          />
        </LimitsCounter>
      </Section>
    </Container>
  );
};

export default EducationHeadEditor;
