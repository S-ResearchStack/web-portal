import React, { useEffect } from 'react';
import usePrevious from 'react-use/lib/usePrevious';

import LoadableImageGridEditor from 'src/modules/common/LoadableImageGridEditor';
import type { ImagesAnswer } from './surveyEditor.slice';
import type { ImageSelectionQuestionItem } from './questions/image-selection';

const MIN_ANSWERS = 3;
const MAX_ANSWERS = 8;

interface QuestionCardImageOptionsProps {
  data: ImagesAnswer[];
  uniqueId: string | number;
  onChange: (data: ImagesAnswer[]) => void;
  onDescriptionChange: (description: string) => void;
  options: ImageSelectionQuestionItem['options'];
  createEmptyAnswer: () => ImagesAnswer;
  compact?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  getUploadObjectPath: (file: File) => string;
}

const QuestionCardImageOptions: React.FC<QuestionCardImageOptionsProps> = ({
  data,
  uniqueId,
  onChange,
  options,
  onDescriptionChange,
  createEmptyAnswer,
  compact,
  containerRef,
  getUploadObjectPath,
}) => {
  const isMultiple = options.multiSelect;

  const prevIsMultiple = usePrevious(isMultiple);

  useEffect(() => {
    if (prevIsMultiple !== isMultiple) {
      const description = isMultiple ? 'Please check all that apply.' : 'Please select one option.';

      onDescriptionChange(description);
    }
  }, [prevIsMultiple, onDescriptionChange, options, isMultiple]);

  return (
    <LoadableImageGridEditor
      data={data}
      uniqueId={uniqueId}
      onChange={onChange}
      imageLabels={options.imageLabels}
      createCell={createEmptyAnswer}
      limits={{ min: MIN_ANSWERS, max: MAX_ANSWERS }}
      compact={compact}
      gap={24}
      containerRef={containerRef}
      getUploadObjectPath={getUploadObjectPath}
    />
  );
};

export default QuestionCardImageOptions;
