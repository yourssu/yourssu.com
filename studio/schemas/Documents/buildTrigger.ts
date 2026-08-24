import { MdOutlineUpdate as icon } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'buildTrigger',
  title: '사이트 반영',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'lastUpdated',
      title: '마지막 반영 요청',
      description:
        '변경한 콘텐츠를 모두 게시한 뒤 아래의 사이트 반영 요청 버튼을 눌러주세요.',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: '사이트 반영' }),
  },
});
