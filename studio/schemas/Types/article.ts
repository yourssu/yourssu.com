import {defineField, defineType} from 'sanity'

export default defineType({
  type: 'object',
  name: 'article',
  fields: [
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      description: '미디엄 글 링크를 입력해주세요.'
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: '제목',
      description: '미디엄 글 제목을 입력해주세요.'
    }),
    defineField({
      name: 'author',
      type: 'string',
      title: '저자',
      description: '미디엄 글 저자를 입력해주세요.'
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: '설명',
      description: '미디엄 글 설명을 입력해주세요.'
    }),
    defineField({
      name: 'image',
      type: 'url',
      title: '이미지 URL',
      description: '미리보기 이미지 URL을 입력해주세요.',
    }),
  ],
  preview: {
  select: {
    title: 'title',
    subtitle: 'author',
  },
},
})