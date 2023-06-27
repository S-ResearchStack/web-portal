import React from 'react';
import PDF from 'src/assets/education/pdf.svg';
import Scratch from 'src/assets/education/scratch.svg';
import Video from 'src/assets/education/video.svg';
import { PublicationContentSource } from 'src/modules/api';

export const getPublicationIconByType = (type: PublicationContentSource) =>
  ({
    SCRATCH: <Scratch />,
    PDF: <PDF />,
    VIDEO: <Video />,
  }[type]);
