import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'inaWordContent',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
    }),
    defineField({
      name: 'word',
      title: '한마디',
      type: 'text',
      description: '소개 페이지에서 줄바꿈도 반영됩니다. 이를 고려해서 작성해주세요. (2줄 이내)',
    }),
  ],
})
