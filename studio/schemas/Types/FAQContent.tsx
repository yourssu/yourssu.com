import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'FAQContent',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
    }),
    defineField({
      name: 'FAQList',
      title: 'FAQ 목록',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'FAQItem',
          title: 'FAQ 항목',
          fields: [
            {
              name: 'question',
              title: '질문',
              type: 'string',
            },
            {
              name: 'answer',
              title: '답변',
              type: 'text',
            },
          ],
          // 스튜디오에서 질문 내용이 바로 보이도록 설정
          preview: {
            select: {
              title: 'question',
            },
          },
        },
      ],
    }),
  ],
})