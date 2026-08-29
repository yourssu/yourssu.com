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
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      description:
        '부서 이름을 바꿔도 유지되는 상세 페이지 경로입니다. 게시 후에는 특별한 이유 없이 변경하지 마세요.',
      options: {
        source: 'name',
        slugify: (input) =>
          input
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, ''),
      },
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value?.current &&
            /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(value.current)
              ? true
              : '영문 소문자, 숫자, 밑줄 또는 하이픈만 사용할 수 있습니다.',
          ),
    }),
    defineField({
      name: 'analytics',
      title: '분석 메타데이터',
      type: 'departmentAnalytics',
      description: '표시 이름이나 URL과 분리된 PostHog 팀 식별 값입니다.',
      validation: (rule) => rule.required(),
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
