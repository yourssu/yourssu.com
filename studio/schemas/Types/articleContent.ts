import {defineField,  defineType} from 'sanity'

export default defineType({
  name: 'articleContent',
  title: '미디엄',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
    }),
    defineField({
      name: 'article',
      title: '글 목록',
      type: 'array',
      of: [{ type: 'article' }],
    }),
  ],
})
