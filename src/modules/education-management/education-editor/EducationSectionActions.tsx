import React from 'react';

import Button from 'src/common/components/Button';
import PlusIcon from 'src/assets/icons/plus.svg';
import ImageIcon from 'src/assets/icons/image.svg';
import VideoIcon from 'src/assets/education/video.svg';

type EducationSectionActionsProps = {
  onAddImage: () => void;
  onAddText: () => void;
  onAddVideo?: () => void;
};

const EducationSectionActions = ({ onAddImage, onAddText, onAddVideo }: EducationSectionActionsProps) => (
  <>
    <Button
      width={193}
      fill="bordered"
      icon={<VideoIcon />}
      onClick={onAddVideo}
      data-testid="add-video-publication"
    >
      Add video block
    </Button>
    <Button
      width={193}
      fill="bordered"
      icon={<ImageIcon />}
      onClick={onAddImage}
      data-testid="add-image-publication"
    >
      Add image block
    </Button>
    <Button
      width={193}
      fill="bordered"
      icon={<PlusIcon />}
      onClick={onAddText}
      data-testid="add-text-publication"
    >
      Add text block
    </Button>
  </>
);

export default EducationSectionActions;
