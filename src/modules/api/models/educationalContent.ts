type Educational = {
  title: string;
  category: string;
  type: EducationalContentType;
  status: EducationalContentStatus;
  content: EducationContentRequest;
  publishedAt?: string;
};

export type EducationalCreateRequest = Educational;
export type EducationalCreateResponse = {
  id: string;
};

export type EducationalUpdateRequest = Partial<Educational>;
export type EducationalResponse = Educational & EducationalCreateResponse & {
  creatorId?: string;
  modifiedAt?: string;
};

export type EducationalListResponse = EducationalResponse[];

export type EducationalContentStatus = 'DRAFT' | 'PUBLISHED';

export enum EducationalContentType {
  SCRATCH = 'SCRATCH',
  PDF = 'PDF',
  VIDEO = 'VIDEO',
};

export type BlockContentType = 'TEXT' | 'IMAGE' | 'VIDEO';

export type EducationInnerContent = PdfContent | VideoContent | ScratchContent;
export type ItemType = PdfContent | VideoContent | BlockContent;

export type EducationContentRequest =
  | (Pick<PdfContent, 'url'> & { description: string })
  | (Pick<VideoContent, 'url'> & { description: string })
  | ScratchContentRequest;

export type ScratchContentRequest = Omit<ScratchContent, 'id' | 'blocks'> & {
  blocks:
  | TextBlock[]
  | (Omit<ImageBlock, 'images'> & { images: Omit<ImageBlockOption, 'touched'>[] })[]
  | Omit<VideoBlock, 'touched'>[];
};
export type PdfContentRequest = Pick<PdfContent, 'url'> & { description: string };
export type VideoContentRequest = Pick<VideoContent, 'url'> & { description: string };

type CommonContent = {
  id: string;
  text: string;
  type: BlockContentType;
};
export interface PdfContent extends CommonContent {
  id: string;
  url: string;
  text: string
};

export interface VideoContent extends CommonContent {
  id: string;
  url: string;
  text: string;
};
export interface TextBlock {
  id: string;
  type: 'TEXT';
  text: string;
  sequence: number;
};

type ImageBlockOption = {
  id: string;
  url: string;
  path: string;
  caption?: string;
  touched: boolean;
};

export interface ImageBlock {
  id: string;
  type: 'IMAGE';
  images: ImageBlockOption[];
  sequence: number;
};

export interface VideoBlock {
  id: string;
  type: 'VIDEO';
  url: string;
  path: string;
  text: string;
  touched: boolean;
  sequence: number;
};

export type BlockContent = TextBlock | ImageBlock | VideoBlock;

export type ScratchContent = {
  id: string;
  coverImage: string;
  description: string;
  blocks: BlockContent[];
};

export type PublicationImageOption = {
  id: string;
  image: string;
  caption?: string;
  touched?: boolean;
};
