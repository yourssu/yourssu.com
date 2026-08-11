import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'dateContent',
  type: 'object',
  fields: [
    defineField({
      name: 'start',
      title: '시작 날짜',
      type: 'date',
    }),
    defineField({
      name: 'end',
      title: '마감 날짜',
      type: 'date',
    }),
  ],
})
