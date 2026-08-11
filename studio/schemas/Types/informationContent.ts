import {defineField, defineType} from 'sanity'

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
      title: '번호',
      name: 'key',
      type: 'number',
    }),
    defineField({
      name: 'name',
      title: '부서 이름',
      type: 'string',
      description: '영어로 입력해주세요.',
    }),
    defineField({
      name: 'sub_name',
      title: '부서 이름 (축약)',
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
      description: '소개 페이지에서 줄바꿈도 반영됩니다. 이를 고려해서 작성해주세요.',
    }),
    defineField({
      name: 'apply_link',
      title: '지원서 링크',
      type: 'string',
    }),
  ],
})
