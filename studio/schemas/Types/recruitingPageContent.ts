import { defineField, defineType } from 'sanity';

import { FAQ_LINK_ANALYTICS_ACTIONS } from '../../../shared/analyticsMetadata';

const header = defineType({
  name: 'recruitingPageHeader',
  title: '섹션 제목',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: '부제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
});

const banner = defineType({
  name: 'recruitingPageBanner',
  title: '배너',
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
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
});

const position = defineType({
  name: 'recruitingPagePosition',
  title: '모집 포지션',
  type: 'object',
  fields: [
    defineField({
      name: 'department',
      title: '부서',
      type: 'reference',
      to: [{ type: 'department' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'department.basicInformation.name',
      media: 'department.basicInformation.icon',
      isRecruiting: 'department.basicInformation.isRecruiting',
    },
    prepare({ title, media, isRecruiting }) {
      return {
        title,
        subtitle: isRecruiting ? '모집 중' : '모집 마감',
        media,
      };
    },
  },
});

const positions = defineType({
  name: 'recruitingPagePositions',
  title: '모집 포지션',
  type: 'object',
  fields: [
    defineField({
      name: 'header',
      title: '제목',
      type: 'recruitingPageHeader',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cards',
      title: '포지션 목록',
      type: 'array',
      of: [{ type: 'recruitingPagePosition' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

const idealCard = defineType({
  name: 'recruitingPageIdealCard',
  title: '인재상',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
});

const ideal = defineType({
  name: 'recruitingPageIdeal',
  title: '인재상',
  type: 'object',
  fields: [
    defineField({
      name: 'header',
      title: '제목',
      type: 'recruitingPageHeader',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cards',
      title: '인재상 목록',
      type: 'array',
      of: [{ type: 'recruitingPageIdealCard' }],
      validation: (rule) => rule.required().length(3),
    }),
  ],
});

const journeyStep = defineType({
  name: 'recruitingPageJourneyStep',
  title: '합류 단계',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
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
    defineField({
      name: 'tasks',
      title: '세부 단계',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
});

const journey = defineType({
  name: 'recruitingPageJourney',
  title: '합류 여정',
  type: 'object',
  fields: [
    defineField({
      name: 'header',
      title: '제목',
      type: 'recruitingPageHeader',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'steps',
      title: '합류 단계',
      type: 'array',
      of: [{ type: 'recruitingPageJourneyStep' }],
      validation: (rule) => rule.required().length(3),
    }),
    defineField({
      name: 'notice',
      title: '안내 문구',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
});

const faqLink = defineType({
  name: 'recruitingPageFaqLink',
  title: '답변 링크',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: '표시 문구',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
    }),
    defineField({
      name: 'analyticsAction',
      title: '분석 동작',
      description:
        '문의 링크면 contact, 이벤트를 수집하지 않는 일반 링크면 none을 선택하세요.',
      type: 'string',
      options: {
        list: FAQ_LINK_ANALYTICS_ACTIONS.map((value) => ({
          title: value,
          value,
        })),
      },
      validation: (rule) => rule.required(),
    }),
  ],
});

const faqItem = defineType({
  name: 'recruitingPageFaqItem',
  title: 'FAQ 항목',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: '질문',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: '답변',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: '답변 링크',
      type: 'recruitingPageFaqLink',
    }),
  ],
  preview: { select: { title: 'question', subtitle: 'answer' } },
});

const faq = defineType({
  name: 'recruitingPageFaq',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'header',
      title: '제목',
      type: 'recruitingPageHeader',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'FAQ 목록',
      type: 'array',
      of: [{ type: 'recruitingPageFaqItem' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

export const recruitingPageContentTypes = [
  header,
  banner,
  positions,
  position,
  ideal,
  idealCard,
  journey,
  journeyStep,
  faq,
  faqItem,
  faqLink,
];
