import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'roadToProContent',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
    }),
    defineField({
      name: 'roadToPro_list',
      title: '영상 목록',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'roadToPro'}]}],
    }),
  ],
})
