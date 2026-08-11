import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'skillContent',
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
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'notice',
      title: '참고사항',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
})
