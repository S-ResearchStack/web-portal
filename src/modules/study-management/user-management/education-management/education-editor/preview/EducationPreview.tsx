import React, { useMemo } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';

import styled from 'styled-components';

import { PublicationImageOption } from 'src/modules/api';
import { useAppDispatch } from 'src/modules/store';
import { setSidebarForceCollapsed } from 'src/modules/main-layout/sidebar/sidebar.slice';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import { colors, px, typography } from 'src/styles';
import PreviewScreenLayout from '../../../common/PreviewScreenLayout';
import { useEducationEditor } from '../educationEditor.slice';
import PreviewHeader from './PreviewHeader';

const EducationPreviewScreenLayout = styled(PreviewScreenLayout)`
  margin-top: ${px(40)};
`;

const Content = styled.div`
  padding: ${px(6)} ${px(24)} ${px(24)};
  font-size: ${px(19)};
  line-height: ${px(24)};
`;

const ScrollableContainer = withCustomScrollBar(styled.div``)`
  width: 100%;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${colors.textPrimary} !important;
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const EducationContentWrap = styled.div`
  ${typography.bodySmallRegular};
  line-height: ${px(19)};
  width: 100%;
  > div:not(:last-child) {
    margin-bottom: ${px(32)};
  }
`;

const ContentImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${px(8)};
  > div {
    > div:not(:last-child) {
      margin-bottom: ${px(8)};
    }
  }
`;

const Image = styled.div<{ src: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: transparent;
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  width: 100%;
  min-height: ${px(208)};
  position: relative;
`;

const ImageTitle = styled.div`
  font-size: ${px(10)};
  line-height: ${px(13)};
  text-transform: uppercase;
`;

const PreviewTypeDescription = styled.div`
  max-width: ${px(270)};
  min-width: ${px(254)};
  ${typography.bodySmallRegular};
  color: ${colors.primary};
  background-color: ${colors.primaryLight};
  border-radius: ${px(4)};
  padding: ${px(16)} ${px(24)};
  margin: 0 ${px(40)} ${px(24)};
`;

const ContentImage = ({ items }: { items: PublicationImageOption[] }) =>
  items.length ? (
    <ContentImageWrapper>
      {items.map((i) => (
        <div key={i.id}>
          <Image src={i.image} />
          <ImageTitle key={i.caption}>{i.caption}</ImageTitle>
        </div>
      ))}
    </ContentImageWrapper>
  ) : null;

const EducationPreview = () => {
  const dispatch = useAppDispatch();
  const { publication } = useEducationEditor();
  const { attachment, source, title, category, educationContent } = publication;

  useLifecycles(
    () => {
      dispatch(setSidebarForceCollapsed(true));
    },
    () => {
      dispatch(setSidebarForceCollapsed(false));
    }
  );

  const renderContent = useMemo(
    () => (
      <Content>
        {educationContent.length ? (
          <EducationContentWrap>
            {educationContent
              .map((s) => s.children)
              .flat()
              .map((i) =>
                i.type === 'TEXT' ? (
                  <div key={i.id}>{i.text}</div>
                ) : (
                  <ContentImage key={i.id} items={i.images} />
                )
              )}
          </EducationContentWrap>
        ) : (
          'Content text goes here'
        )}
      </Content>
    ),
    [educationContent]
  );

  return (
    <>
      <EducationPreviewScreenLayout title="Education" data-testid="education-preview">
        <ScrollableContainer>
          <PreviewHeader type={source} title={title} category={category} attachment={attachment} />
          {renderContent}
        </ScrollableContainer>
      </EducationPreviewScreenLayout>
      <PreviewTypeDescription>
        {source !== 'VIDEO'
          ? 'Scroll within the preview phone to see more content'
          : 'The preview screens are static snapshots.'}
      </PreviewTypeDescription>
    </>
  );
};

export default EducationPreview;
