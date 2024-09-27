import React from 'react';

import { v4 as uuid } from 'uuid';
import styled, { css, useTheme } from 'styled-components';

import DeleteIcon from 'src/assets/icons/trash_can.svg';
import { laptopMq } from 'src/common/components/SimpleGrid';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import { colors, px, typography } from 'src/styles';
import TextArea, { TextAreaProps } from 'src/common/components/TextArea';
import { ItemType, TextBlock, ImageBlock, PdfContent, VideoBlock, VideoContent } from 'src/modules/api';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import LoadableImageGridEditor, {
  LoadableImageGridEditorProps,
} from 'src/modules/common/LoadableImageGridEditor';
import { StyledButton } from '../../task-management/survey/survey-editor/QuestionCard';
import { EducationItemErrors, emptyImageItem } from './educationEditor.slice';
import { newId } from './utils';
import LoadableVideoGridEditor, { LoadableVideoGridEditorProps } from 'src/modules/common/LoadableVideoGridEditor';

export const EDUCATION_CARD_HEIGHT = 219;
export const EDUCATION_CARD_LOADER_TITLE_WIDTH = 258;

const Container = styled.div`
  width: 100%;
  padding: ${px(24)};
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CardTitle = styled.div`
  ${typography.labelRegular};
  color: ${colors.textPrimary};
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const MainInformation = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${px(8)};
`;

const CardContent = styled.div``;

const CardActions = styled.div`
  margin-top: ${px(20)};
  height: ${px(24)};
  display: flex;
  align-items: center;
  gap: ${px(16)};
  justify-content: flex-end;

  @media screen and ${laptopMq.media} {
    margin-left: 0;
  }
`;

const DeleteIconButton = styled(StyledButton) <{ $visible?: boolean }>`
  ${({ $visible }) =>
    !$visible &&
    css`
      opacity: 0;
      pointer-events: none;
    `}
`;

const ContentTextArea = withLocalDebouncedState<
  HTMLTextAreaElement,
  TextAreaProps
>(withCustomScrollBar(TextArea)`
  min-height: ${px(100)};
  padding: ${px(8)} ${px(16)};
`);

const ImageContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${px(16)};
  gap: ${px(4)};
`;

const ImageContentCaption = styled.div`
  ${typography.labelRegular};
  color: ${colors.textSecondaryGray};
  letter-spacing: ${px(0.48)};
`;

const TextContent = (
  props: Omit<TextAreaProps, 'appearance' | 'scrollbarOffsetRight' | 'scrollbarTrackColor'>
) => {
  const theme = useTheme();

  return (
    <ContentTextArea
      autoHeight
      appearance="bordered"
      scrollbarOffsetRight={8}
      scrollbarTrackColor={theme.colors.onPrimary}
      placeholder="Add your text here*"
      maxLength={1000000}
      sizeUpdaterUniqueValue={[]}
      {...props}
    />
  );
};

const ImageContent = (props: LoadableImageGridEditorProps) => (
  <ImageContentContainer>
    <LoadableImageGridEditor {...props} placeholder="Add caption (optional)" />
    <ImageContentCaption>Upload a PNG, JPG, GIF or SVG file of up 100MBs.</ImageContentCaption>
  </ImageContentContainer>
);
const VideoBlockContent = (props: LoadableVideoGridEditorProps) => (
  <ImageContentContainer>
    <LoadableVideoGridEditor {...props} placeholder="Add caption (optional)" />
    <ImageContentCaption>Upload a MP4 file of up 100MBs.</ImageContentCaption>
  </ImageContentContainer>
);

const MIN_IMAGES = 2;
const MAX_IMAGES = 8;

type EducationCardProps = {
  item: ItemType;
  index: number;
  errors?: EducationItemErrors;
  onChange: (data: ItemType) => void;
  onRemove?: (item: ItemType) => void;
  compact?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EducationCardView = ({
  item,
  index,
  errors,
  onChange,
  onRemove,
  compact,
}: EducationCardProps) => {
  const renderContent = () => {
    switch (item?.type) {
      case 'IMAGE':
        return (
          <ImageContent
            imageLabels
            data={(item as ImageBlock)?.images?.map(({ caption, ...i }) => ({ ...i, value: caption ?? '', image: i.url }))}
            uniqueId={item?.id}
            onChange={(items) =>
              onChange({
                ...item,
                images: items.map(({ value, image, ...i }) => ({ ...i, caption: value, url: image, path: image.split('/').pop()?.split('?').shift() || '' })),
              } as ImageBlock)
            }
            compact={compact}
            createCell={() => emptyImageItem({ touched: false })}
            limits={{ min: MIN_IMAGES, max: MAX_IMAGES }}
            getUploadObjectPath={() => `${uuid()}`}
            gap={16}
          />
        );
      case 'VIDEO':
        return (
          <VideoBlockContent
            imageLabels
            data={([item] as VideoBlock[])?.map(({ text, ...i }) => ({ ...i, text: text || '', url: i.url }))}
            uniqueId={item?.id}
            onChange={(items) =>
              onChange({
                ...items[0],
                path: items[0].url.split('/').pop()?.split('?').shift() || ''
              } as VideoBlock)
            }
            compact={compact}
            createCell={() => { }}
            limits={{ min: MIN_IMAGES, max: MAX_IMAGES }}
            getUploadObjectPath={() => `${uuid()}`}
            gap={16}
          />
        );

      default:
        return (
          <TextContent
            value={(item as PdfContent | VideoContent | TextBlock)?.text || ''}
            onChange={(evt) => onChange({ ...item, text: evt.target.value })}
            invalid={!!errors?.text?.empty}
          />
        );
    }
  };

  const renderTitle = () => {
    const num = index + 1;

    switch (item?.type) {
      case 'IMAGE':
        return `Image item ${num}`;

      case 'VIDEO':
        return `Video item ${num}`;

      default:
        return `Body text ${num}`;
    }
  };

  return (
    <Container data-id={item.id}>
      <MainInformation>
        <CardTitle>{renderTitle()}</CardTitle>
        <CardContent>{renderContent()}</CardContent>
      </MainInformation>
      <CardActions>
        {!!onRemove &&
          <DeleteIconButton
            data-testid={`remove-publication-button-${item.id}`}
            rippleOff
            fill="text"
            rate="icon"
            aria-label="Delete Question"
            $visible={!!onRemove}
            icon={<DeleteIcon />}
            onClick={() => onRemove?.(item)}
          />
        }
      </CardActions>
    </Container>
  );
};

export default EducationCardView;
