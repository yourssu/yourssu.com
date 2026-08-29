import { defineField, defineType } from 'sanity';

import {
  MAIN_CONTENT_CATEGORIES,
  MAIN_CONTENT_TYPES,
  TF_NAMES,
} from '../../../shared/analyticsMetadata';

const analyticsOptions = (values: readonly string[]) =>
  values.map((value) => ({ title: value, value }));

const hero = defineType({
  name: 'mainPageHero',
  title: '메인 배너',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '문구',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: '배경 이미지',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'buttonText',
      title: '버튼 문구',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'buttonLink',
      title: '버튼 링크',
      type: 'string',
      description: '사이트 내부 경로를 입력해주세요. 예: /recruiting',
      validation: (rule) => rule.required(),
    }),
  ],
});

const productItem = defineType({
  name: 'mainPageProductItem',
  title: '프로덕트',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '이름',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: '이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: '서비스 링크',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'analyticsTfName',
      title: '분석용 TF 값',
      description:
        'PostHog main_tf_card_click의 tf_name에 저장되는 고정 값입니다.',
      type: 'string',
      options: { list: analyticsOptions(TF_NAMES) },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description', media: 'image' },
  },
});

const product = defineType({
  name: 'mainPageProduct',
  title: '프로덕트',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '영문 제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: '한글 제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: '프로덕트 목록',
      type: 'array',
      of: [{ type: 'mainPageProductItem' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

const missionVisionItem = defineType({
  name: 'mainPageMissionVisionItem',
  title: '미션 · 비전',
  type: 'object',
  fields: [
    defineField({
      name: 'subtitle',
      title: '소제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'desktopDescription',
      title: '설명 (데스크톱)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobileDescription',
      title: '설명 (모바일)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: '배경 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'image' },
  },
});

const coreValueItem = defineType({
  name: 'mainPageCoreValueItem',
  title: '핵심 가치',
  type: 'object',
  fields: [
    defineField({
      name: 'desktopTitle',
      title: '제목 (데스크톱)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobileTitle',
      title: '제목 (모바일)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: '요약',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'desktopDescription',
      title: '설명 (데스크톱)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'mobileDescription',
      title: '설명 (모바일)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: '배경 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'desktopTitle', subtitle: 'summary', media: 'image' },
  },
});

const coreValue = defineType({
  name: 'mainPageCoreValue',
  title: '핵심 가치',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '영문 제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: '한글 제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: '핵심 가치 목록',
      type: 'array',
      of: [{ type: 'mainPageCoreValueItem' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

const cultureItem = defineType({
  name: 'mainPageCultureItem',
  title: '문화',
  type: 'object',
  fields: [
    defineField({
      name: 'tag',
      title: '시기',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: '이름',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'tag' } },
});

const culture = defineType({
  name: 'mainPageCulture',
  title: '문화',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '영문 제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: '한글 제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: '문화 목록',
      type: 'array',
      of: [{ type: 'mainPageCultureItem' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

const channelItem = defineType({
  name: 'mainPageChannelItem',
  title: '채널 콘텐츠',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: '링크',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: '썸네일',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: '태그',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'analyticsCategory',
      title: '분석용 카테고리',
      description:
        'PostHog 콘텐츠 이벤트의 category 값입니다. 분류가 없으면 none을 선택하세요.',
      type: 'string',
      options: { list: analyticsOptions(MAIN_CONTENT_CATEGORIES) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'analyticsContentType',
      title: '분석용 콘텐츠 유형',
      description:
        'PostHog 콘텐츠 이벤트의 content_type에 저장되는 고정 값입니다.',
      type: 'string',
      options: { list: analyticsOptions(MAIN_CONTENT_TYPES) },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'link', media: 'image' },
  },
});

const channel = defineType({
  name: 'mainPageChannel',
  title: '채널 콘텐츠',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: '콘텐츠 목록',
      type: 'array',
      of: [{ type: 'mainPageChannelItem' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

const review = defineType({
  name: 'mainPageReview',
  title: '활동 후기',
  type: 'object',
  fields: [
    defineField({
      name: 'nickname',
      title: '닉네임',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'part',
      title: '파트',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'review',
      title: '후기',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'nickname', subtitle: 'part' } },
});

const recruit = defineType({
  name: 'mainPageRecruit',
  title: '리크루팅 배너',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: '배경 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'desktopTitle',
      title: '문구 (데스크톱)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobileTitle',
      title: '문구 (모바일)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'desktopButtonText',
      title: '버튼 문구 (데스크톱)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobileButtonText',
      title: '버튼 문구 (모바일)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'buttonLink',
      title: '버튼 링크',
      type: 'string',
      description: '사이트 내부 경로를 입력해주세요. 예: /recruiting',
      validation: (rule) => rule.required(),
    }),
  ],
});

export const mainPageContentTypes = [
  hero,
  product,
  productItem,
  missionVisionItem,
  coreValue,
  coreValueItem,
  culture,
  cultureItem,
  channel,
  channelItem,
  review,
  recruit,
];
