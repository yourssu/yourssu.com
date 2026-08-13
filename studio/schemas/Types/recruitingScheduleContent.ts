import { defineField, defineType } from 'sanity';

export const recruitingScheduleDepartmentOverride = defineType({
  name: 'recruitingScheduleDepartmentOverride',
  title: '부서별 일정 예외',
  type: 'object',
  fields: [
    defineField({
      name: 'department',
      title: '부서',
      type: 'reference',
      to: [{ type: 'department' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'formSchedule',
      title: '부서별 서류 일정',
      type: 'dateContent',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'procedure',
      title: '부서별 지원 절차',
      type: 'array',
      of: [{ type: 'applyStepContent' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'department.basicInformation.name',
    },
  },
});

export default defineType({
  name: 'recruitingScheduleContent',
  type: 'object',
  fields: [
    defineField({
      name: 'departments',
      title: '적용 부서',
      description: '이 일정으로 리쿠르팅할 부서를 모두 선택해주세요.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'department' }] }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'formSchedule',
      title: '리쿠르팅 서류 일정',
      type: 'dateContent',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'procedure',
      title: '전체 지원 절차',
      type: 'array',
      of: [{ type: 'applyStepContent' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'departmentOverrides',
      title: '부서별 일정 예외',
      description:
        '기본 일정과 다른 부서만 선택해주세요. 선택한 부서는 서류 일정과 지원 절차를 모두 입력해야 합니다.',
      type: 'array',
      of: [{ type: 'recruitingScheduleDepartmentOverride' }],
    }),
  ],
});
