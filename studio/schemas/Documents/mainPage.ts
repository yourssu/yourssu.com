import { MdHome as icon } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'mainPage',
  title: '메인 페이지',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'hero',
      title: '메인 배너',
      type: 'mainPageHero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'product',
      title: '프로덕트',
      type: 'mainPageProduct',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'missionVision',
      title: '미션 · 비전',
      type: 'array',
      of: [{ type: 'mainPageMissionVisionItem' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'coreValue',
      title: '핵심 가치',
      type: 'mainPageCoreValue',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'culture',
      title: '문화',
      type: 'mainPageCulture',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'channel',
      title: '채널 콘텐츠',
      type: 'mainPageChannel',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviews',
      title: '활동 후기',
      type: 'array',
      of: [{ type: 'mainPageReview' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'recruit',
      title: '리크루팅 배너',
      type: 'mainPageRecruit',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: '메인 페이지' }),
  },
});
