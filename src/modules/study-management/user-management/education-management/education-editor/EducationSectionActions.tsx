import React from 'react';

import Button from 'src/common/components/Button';
import PlusIcon from 'src/assets/icons/plus.svg';
import ImageIcon from 'src/assets/icons/image.svg';

type EducationSectionActionsProps = {
  onAddImage: () => void;
  onAddText: () => void;
};

const EducationSectionActions = ({ onAddImage, onAddText }: EducationSectionActionsProps) => (
  <>
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
      width={173}
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
