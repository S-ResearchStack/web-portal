import { useCallback } from 'react';

import { useAppDispatch } from 'src/modules/store';
import { createEducationContent } from './education-editor/educationEditor.slice';
import type { EducationalContentType } from 'src/modules/api';

export const useCreateEducation = () => {
  const dispatch = useAppDispatch();

  return {
    create: useCallback(
      ({ source }: { source: EducationalContentType }) => dispatch(createEducationContent({ educationType: source })),
      [dispatch]
    ),
  };
};
