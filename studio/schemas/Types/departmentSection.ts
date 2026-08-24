import { defineArrayMember, defineField, defineType } from 'sanity';

const sectionLabels: Record<string, string> = {
  applyProcedure: '합류 여정',
  articles: '아티클',
  faq: 'FAQ',
  quote: '한 마디',
  richText: '리치 텍스트',
  roadToPro: 'Road to Pro',
};

export default defineType({
  name: 'departmentSection',
  title: '부서 상세 섹션',
  type: 'object',
  initialValue: { kind: 'richText' },
  fields: [
    defineField({
      name: 'kind',
      title: '섹션 타입',
      type: 'string',
      options: {
        list: [
          { title: sectionLabels.richText, value: 'richText' },
          { title: sectionLabels.applyProcedure, value: 'applyProcedure' },
          { title: sectionLabels.quote, value: 'quote' },
          { title: sectionLabels.faq, value: 'faq' },
          { title: sectionLabels.roadToPro, value: 'roadToPro' },
          { title: sectionLabels.articles, value: 'articles' },
        ],
        layout: 'dropdown',
      },
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
      title: '안내 문구',
      type: 'string',
      hidden: ({ parent }) => parent?.kind !== 'richText',
    }),
    defineField({
      name: 'body',
      title: '내용',
      type: 'array',
      hidden: ({ parent }) => parent?.kind !== 'richText',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: '본문', value: 'normal' },
            { title: '소제목', value: 'h3' },
            { title: '작은 소제목', value: 'h4' },
            { title: '인용', value: 'blockquote' },
          ],
          lists: [
            { title: '목록', value: 'bullet' },
            { title: '번호 목록', value: 'number' },
          ],
          marks: {
            annotations: [
              {
                name: 'departmentSectionLink',
                title: '링크',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({
                        scheme: ['http', 'https', 'mailto'],
                      }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'quoteText',
      title: '한 마디',
      type: 'text',
      rows: 3,
      hidden: ({ parent }) => parent?.kind !== 'quote',
    }),
    defineField({
      name: 'faqList',
      title: 'FAQ 목록',
      type: 'array',
      hidden: ({ parent }) => parent?.kind !== 'faq',
      of: [{ type: 'FAQItem' }],
    }),
    defineField({
      name: 'roadToProList',
      title: '영상 목록',
      type: 'array',
      hidden: ({ parent }) => parent?.kind !== 'roadToPro',
      of: [{ type: 'reference', to: [{ type: 'roadToPro' }] }],
    }),
    defineField({
      name: 'articles',
      title: '글 목록',
      type: 'array',
      hidden: ({ parent }) => parent?.kind !== 'articles',
      of: [{ type: 'article' }],
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      if (!value) return true;
      const section = value as {
        articles?: unknown[];
        body?: unknown[];
        faqList?: unknown[];
        kind?: string;
        quoteText?: string;
        roadToProList?: unknown[];
      };

      switch (section.kind) {
        case 'richText':
          return section.body?.length ? true : '내용을 입력해주세요.';
        case 'applyProcedure':
          return true;
        case 'quote':
          return section.quoteText?.trim() ? true : '한 마디를 입력해주세요.';
        case 'faq':
          return section.faqList?.length
            ? true
            : 'FAQ를 한 개 이상 추가해주세요.';
        case 'roadToPro':
          return section.roadToProList?.length
            ? true
            : '영상을 한 개 이상 추가해주세요.';
        case 'articles':
          return section.articles?.length
            ? true
            : '글을 한 개 이상 추가해주세요.';
        default:
          return '지원하지 않는 섹션 타입입니다.';
      }
    }),
  preview: {
    select: { kind: 'kind', title: 'title' },
    prepare({ kind, title }) {
      return {
        title: title || '제목 없음',
        subtitle: sectionLabels[kind] || kind || '타입 없음',
      };
    },
  },
});
