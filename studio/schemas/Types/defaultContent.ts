import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'defaultContent',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: '내용',
      description: '소제목은 [소제목] 형식으로 입력해주세요.',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
})
