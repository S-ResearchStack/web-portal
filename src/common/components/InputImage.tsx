import React, { useState } from "react"
import styled from 'styled-components';
import { colors, px } from 'src/styles';
import Image from 'src/assets/icons/image.svg';

const InputImageFrame = styled.div`
  width: 100%;
  height: ${px(400)};
  background-color: ${colors.black15};
  border-radius: ${px(10)};
  border: 1px solid ${colors.black08};
  margin: ${px(20)} 0 ${px(10)} 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
  img {
    width: inherit;
    height: inherit;
    object-fit: contain;
    border-radius: ${px(10)};
  }
  input {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    position: absolute;
  }
`;

export interface InputImageProps {
  onChange: (file: File, url?: string) => void;
}
const InputImage = (props: InputImageProps) => {
  const { onChange } = props;
  const [imageSrc, setImageSrc] = useState<string>('');

  const handleSelectImage = (file?: File) => {
    if (!file) return;
    const url = fileToUrl(file);
    setImageSrc(url);
    onChange(file, url);
  }

  return (
    <InputImageFrame data-testid="input-image">
      {imageSrc
        ? <img src={imageSrc} alt='image' />
        : <Image />
      }
      <input id="image" data-testid="input-image-input" type="file" accept="image/*" onChange={e => handleSelectImage(e.target.files?.[0])} />
    </InputImageFrame>
  )
}
export default InputImage;

const fileToUrl = (file: File) => {
  const url = URL.createObjectURL(file);
  return url;
}
