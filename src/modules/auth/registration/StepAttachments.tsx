import React from "react";
import styled from "styled-components";
import {colors, px, typography} from "src/styles";
import UploadIcon from 'src/assets/icons/upload.svg';

const Wrapper = styled.div``;

const StyledBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: ${px(448)}; 
  min-height: ${px(254)};
  border-radius: ${px(4)};
  border: 1px solid ${colors.textPrimaryBlue10};
  margin-bottom: ${px(4)};
`;

const TitleText = styled.div`
  ${typography.bodySmallRegular}
  color: ${colors.textPrimary};
  text-align: left;
  margin-bottom: ${px(8)};
`;

const UpdateText = styled.div`
  ${typography.bodyXSmallRegular}
  color: ${colors.black60};
  margin-top: ${px(4)};
`;

const DescriptionText  = styled.div`
  ${typography.labelRegular}
  color: ${colors.black60};
  text-align: right;
`;

interface StepAttachmentProps {
  files: string[],
  onUploadFile: () => void
}

const StepAttachment: React.FC<StepAttachmentProps> = (props) => (
    <Wrapper data-testid="step-attachment">
      <TitleText>File upload</TitleText>
      <StyledBox>
        <UploadIcon/>
        <UpdateText>
          Drag & Drop up to 10 files here
        </UpdateText>
      </StyledBox>
      <DescriptionText>Upload either XLM, CSV, PNG, JPG, PDF, or TXT file types (3MB max per file)</DescriptionText>
    </Wrapper>
  )

export default StepAttachment;
