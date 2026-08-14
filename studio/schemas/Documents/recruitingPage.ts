import { MdWork as icon } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'recruitingPage',
  title: '리크루팅 랜딩',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'banner',
      title: '배너',
      type: 'recruitingPageBanner',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'positions',
      title: '모집 포지션',
      type: 'recruitingPagePositions',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ideal',
      title: '인재상',
      type: 'recruitingPageIdeal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'journey',
      title: '합류 여정',
      type: 'recruitingPageJourney',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'recruitingPageFaq',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: '리크루팅 랜딩' }),
  },
});
