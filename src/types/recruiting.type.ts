import type { PortableTextBlock } from '@portabletext/react';
import { IGatsbyImageData } from 'gatsby-plugin-image';

export interface VideoInformation {
  video_thumbnail: { asset: { gatsbyImageData: IGatsbyImageData } };
  presenter: { presenter_nickname: string; presenter_name: string }[];
  video_link: string;
}

export interface BasicInformation {
  name: string;
  short_introduction: string;
  long_introduction: string;
  apply_link: string;
  icon: {
    asset: { gatsbyImageData: IGatsbyImageData };
  };
}

export interface DefaultContentInformation {
  title: string;
  content: string[];
}

export interface SkillContentInformation extends DefaultContentInformation {
  notice: string[];
  content: string[];
}

export interface ApplyProcedureInformation {
  schedule: string;
  step: string;
}

export interface RoadToProInformation {
  title: string;
  roadToPro_list?: (VideoInformation | null)[];
}

export interface InaWordInformation {
  title: string;
  word: string;
}

export interface ArticleInformation {
  url: string;
  title: string;
  author: string;
  description: string;
  image: string;
}

export interface MediumInformation {
  title: string;
  article: ArticleInformation[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQInformation {
  title: string;
  FAQList: FAQItem[];
}

export type DepartmentSectionKind =
  | 'applyProcedure'
  | 'articles'
  | 'faq'
  | 'quote'
  | 'richText'
  | 'roadToPro';

export interface DepartmentSectionInformation {
  _key: string;
  articles?: ArticleInformation[];
  body?: PortableTextBlock[];
  description?: string;
  faqList?: FAQItem[];
  kind: DepartmentSectionKind;
  quoteText?: string;
  roadToProList?: (VideoInformation | null)[];
  title: string;
}
