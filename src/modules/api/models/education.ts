export type Publication = {
  id: string;
  title: string;
  source: PublicationContentSource;
  revisionId: number;
  modifiedAt?: string;
  publishedAt?: string;
  status: PublicationStatus;
  attachment?: string;
  category?: string;
  educationContent?: PublicationContentItem[];
};

export type PublicationStatus = 'DRAFT' | 'PUBLISHED';

export type PublicationContentSource = 'SCRATCH' | 'PDF' | 'VIDEO';

export type PublicationContentType = 'TEXT' | 'IMAGE';

export type PublicationContentEntry = {
  type: PublicationContentType;
  sequence: number;
};

export interface PublicationContentText extends PublicationContentEntry {
  id: string;
  type: 'TEXT';
  text: string;
  sequence: number;
}

export type PublicationImageOption = {
  id: string;
  image: string;
  caption?: string;
  touched?: boolean;
};

export interface PublicationContentImage extends PublicationContentEntry {
  id: string;
  type: 'IMAGE';
  images: PublicationImageOption[];
  sequence: number;
}

export type PublicationContentItem = PublicationContentText | PublicationContentImage;

export interface EducationListSliceFetchArgs {
  projectId: string;
}

export type EducationListResponse = Publication[];

export interface CreatePublicationSliceFetchArgs {
  projectId: string;
  source: PublicationContentSource;
}

export type CreatePublicationResponse = {
  id: string;
  revisionId: number;
};

export type CreatePublicationRequestBody = { source: PublicationContentSource };
