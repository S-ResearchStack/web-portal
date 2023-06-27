import React, { useMemo } from 'react';

import _uniqueId from 'lodash/uniqueId';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';

const PreviewImage = styled.div<{ image: string }>`
  background-image: ${(p) => (p.image ? `url(${p.image})` : 'none')};
  background-size: cover;
  background-position: center;
  width: ${px(148)};
  flex: 1;
`;

const PreviewImageContent = styled.label`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: ${colors.primary05};
  border: ${px(2)} solid ${colors.primary05};
  border-radius: ${px(6)};
  overflow: hidden;
  box-sizing: border-box;
`;

const PreviewImageWrapper = styled.div`
  height: ${px(193)};

  input {
    display: none;
  }

  input:checked + ${PreviewImageContent} {
    border-color: ${colors.primary};
  }
`;

const PreviewImageTitle = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textPrimary};
  flex: 0 0 ${px(44)};
  padding: ${px(4)} ${px(6)};
`;

interface ImageCheckBoxProps {
  image: string;
  title: string;
  checked?: boolean;
  value: number;
  onChange: () => void;
  multiselect: boolean;
  showLabels: boolean;
}

const ImageCheckBox = ({
  image,
  title,
  checked,
  value,
  onChange,
  multiselect,
  showLabels,
}: ImageCheckBoxProps) => {
  const id = useMemo(() => _uniqueId('preview-image-checkbox-'), []);

  return (
    <PreviewImageWrapper>
      <input
        id={id}
        value={value}
        type={multiselect ? 'checkbox' : 'radio'}
        onChange={onChange}
        checked={checked}
      />
      <PreviewImageContent htmlFor={id}>
        {showLabels && <PreviewImageTitle>{title}</PreviewImageTitle>}
        <PreviewImage image={image} />
      </PreviewImageContent>
    </PreviewImageWrapper>
  );
};

export default ImageCheckBox;
