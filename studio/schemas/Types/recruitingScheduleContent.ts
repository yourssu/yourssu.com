import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'recruitingScheduleContent',
  type: 'object',
  fields: [
    defineField({
      name: 'scheduleWithoutAssignment',
      title: '공식 일정으로 리쿠르팅 진행 (과제 미포함)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'scheduleWithAssignment',
      title: '공식 일정으로 리쿠르팅 진행 (과제 포함)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'individualSchedule',
      title: '부서 내부 일정으로 리쿠르팅 진행',
      description: '해당 항목을 선택할 경우, 아래의 "부서 내부 일정"의 하위 항목을 입력해주세요.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'formSchedule',
      title: '부서 내부 일정 - 서류 일정',
      description:
        '"부서 내부 일정으로 리쿠르팅 진행"을 선택하지 않을 시, 해당 항목은 비공개됩니다.',
      type: 'dateContent',
    }),
    defineField({
      name: 'procedure',
      title: '부서 내부 일정 - 전체 지원 절차',
      description:
        '"부서 내부 일정으로 리쿠르팅 진행"을 선택하지 않을 시, 해당 항목은 비공개됩니다.',
      type: 'array',
      of: [{type: 'applyStepContent'}],
    }),
  ],
})
