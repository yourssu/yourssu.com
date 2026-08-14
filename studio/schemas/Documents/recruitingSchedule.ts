import { FaCalendar as icon } from 'react-icons/fa';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'recruitingSchedule',
  title: 'Recruiting Schedule',
  type: 'document',
  icon,
  fields: [
    defineField({
      title: '제목',
      name: 'title',
      description: '예: 20XX년 X학기 리크루팅',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: '현재 리크루팅 일정으로 사용',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'withAssignment',
      title: '과제 포함 일정',
      type: 'recruitingScheduleContent',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'withoutAssignment',
      title: '과제 미포함 일정',
      type: 'recruitingScheduleContent',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
    },
    prepare({ title, isActive }) {
      return {
        title,
        subtitle: isActive ? '활성 일정' : '비활성 일정',
      };
    },
  },
});
