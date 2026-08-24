import { defineField, defineType } from 'sanity';

export default defineType({
  title: '부서 기본 정보',
  name: 'informationContent',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: '부서 아이콘',
      type: 'image',
      options: {
        hotspot: false,
      },
    }),
    defineField({
      name: 'name',
      title: '부서 이름',
      type: 'string',
      description: '영어로 입력해주세요.',
    }),
    defineField({
      name: 'short_introduction',
      title: '간단 소개',
      type: 'string',
    }),
    defineField({
      name: 'long_introduction',
      title: '상세 소개',
      type: 'text',
      description:
        '소개 페이지에서 줄바꿈도 반영됩니다. 이를 고려해서 작성해주세요.',
    }),
    defineField({
      name: 'isRecruiting',
      title: '리크루팅 활성화',
      description:
        '활성화하면 리크루팅 랜딩과 부서 네비게이션에서 상세 페이지에 접근할 수 있습니다.',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'apply_link',
      title: '지원서 링크',
      type: 'string',
    }),
  ],
});
