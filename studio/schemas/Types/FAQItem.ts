import { defineType } from 'sanity';

export const FAQItem = defineType({
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
});
