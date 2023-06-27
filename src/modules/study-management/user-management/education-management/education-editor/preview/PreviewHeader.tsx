import React, { useMemo } from 'react';
import { useAsync } from 'react-use';

import styled from 'styled-components';

import VideoIcon from 'src/assets/education/video.svg';
import ScratchIcon from 'src/assets/education/scratch.svg';
import Button from 'src/common/components/Button';
import { PublicationContentSource } from 'src/modules/api';
import { colors, px, typography } from 'src/styles';
import PlayIcon from 'src/assets/education/play.svg';
import PlayControlsImage from 'src/assets/education/player-controls.svg';
import { getPdfPoster, getVideoPoster } from '../utils';

type PreviewHeaderProps = {
  type?: PublicationContentSource;
  title?: string;
  category?: string;
  attachment?: string;
};

const PDFTitleContentWrap = styled.div`
  max-width: 100%;
  height: ${px(172)};
  display: flex;
  justify-content: space-between;
  margin: ${px(32)} ${px(24)} ${px(18)};
  column-gap: ${px(16)};
`;

const PDFTitleContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  width: ${px(174)};
  max-width: ${px(174)};
  > div {
    width: 100%;
  }
`;

const PDFTextWrap = styled.div`
  ${typography.sdkHeadingMedium};
  color: ${colors.textPrimary};
  max-height: ${px(116)};
  overflow-y: auto;
  overflow-x: hidden;
  > div {
    margin-bottom: ${px(8)};
  }
`;

const StyledButton = styled(Button)`
  border-radius: ${px(50)};
  > div {
    ${typography.bodyMediumSemibold};
    svg {
      margin-right: ${px(4)};
    }
  }
`;

const AttachmentWrap = styled.div<{ src: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: transparent;
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  width: 100%;
  height: ${px(234)};
  position: relative;
`;

const AttachmentWrapPDF = styled(AttachmentWrap)`
  min-width: ${px(122)};
  max-width: ${px(122)};
  min-height: ${px(172)};
  height: auto;
  border-radius: ${px(4)};
`;

const EmptyVideoAttachment = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100%;
  min-height: ${px(201)};
  background-color: ${colors.primaryLight};
  svg {
    width: ${px(56)};
    height: ${px(56)};
  }
`;

const EmptyPDFAttachment = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: ${px(122)};
  max-width: ${px(122)};
  min-height: ${px(172)};
  background-color: ${colors.primaryLight};
  border-radius: ${px(3)};
  svg {
    margin: auto;
    width: ${px(72)};
    height: ${px(72)};
  }
`;

const TitleContent = styled.div`
  color: ${colors.textPrimary};
  font-weight: 600;
  font-size: ${px(27)};
  line-height: ${px(35)};
  margin: ${px(34)} ${px(24)} ${px(16)};
  > div {
    margin-bottom: ${px(6)};
  }
`;

const Category = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.black60};
  line-height: ${px(18)};
`;

const FakeVideoPlayerControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.black40};
  width: 100%;
  height: 100%;
  position: relative;
`;

const FakeVideoPlayerPlaybackControls = styled(PlayControlsImage)`
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
`;

const FakeVideoPlayerPlayBtn = styled(PlayIcon)`
  width: ${px(54)};
  height: ${px(54)};
`;

const TITLE_PLACEHOLDER = 'Title goes here';
const CATEGORY_PLACEHOLDER = 'Category goes here';

const FakeVideoPlayerControls = () => (
  <FakeVideoPlayerControlsContainer>
    <FakeVideoPlayerPlayBtn />
    <FakeVideoPlayerPlaybackControls />
  </FakeVideoPlayerControlsContainer>
);

const PreviewHeader = ({ type, title, category, attachment }: PreviewHeaderProps) => {
  const poster = useAsync(async () => {
    if (!attachment) {
      return undefined;
    }
    switch (type) {
      case 'PDF':
        return getPdfPoster(attachment);
      case 'VIDEO':
        return getVideoPoster(attachment);
      case 'SCRATCH':
        return attachment;
      default:
        return undefined;
    }
  }, [attachment, type]);

  const previewAttachment = useMemo(() => {
    if (!poster.value || poster.loading) {
      if (type === 'VIDEO') {
        return (
          <EmptyVideoAttachment>
            <VideoIcon />
          </EmptyVideoAttachment>
        );
      }
      if (type === 'PDF') {
        return (
          <EmptyPDFAttachment>
            <ScratchIcon />
          </EmptyPDFAttachment>
        );
      }
    } else {
      if (type === 'PDF') {
        return <AttachmentWrapPDF src={poster.value} />;
      }

      if (type === 'VIDEO') {
        return (
          <AttachmentWrap src={poster.value}>
            <FakeVideoPlayerControls />
          </AttachmentWrap>
        );
      }

      return <AttachmentWrap src={poster.value} />;
    }
    return null;
  }, [type, poster.value, poster.loading]);

  const pdfPreviewHeader = useMemo(
    () => (
      <PDFTitleContentWrap>
        {previewAttachment}
        <PDFTitleContent>
          <PDFTextWrap>
            <Category>{category || CATEGORY_PLACEHOLDER}</Category>
            {title || TITLE_PLACEHOLDER}
          </PDFTextWrap>
          <StyledButton fill="bordered" width={164} rate="small">
            View PDF
          </StyledButton>
        </PDFTitleContent>
      </PDFTitleContentWrap>
    ),
    [previewAttachment, category, title]
  );

  return (
    <div>
      {type === 'PDF' ? (
        pdfPreviewHeader
      ) : (
        <>
          {previewAttachment}
          <TitleContent>
            <Category>{category || CATEGORY_PLACEHOLDER}</Category>
            {title || TITLE_PLACEHOLDER}
          </TitleContent>
        </>
      )}
    </div>
  );
};

export default PreviewHeader;
