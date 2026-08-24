import { MdPeople as icon } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'department',
  title: 'Department',
  type: 'document',
  icon,
  fields: [
    defineField({
      title: '부서 기본 정보',
      name: 'basicInformation',
      type: 'informationContent',
    }),
    defineField({
      name: 'sections',
      title: '상세 섹션',
      description: '드래그해서 화면에 표시되는 순서를 변경할 수 있습니다.',
      type: 'array',
      initialValue: [
        {
          _key: 'applyProcedure',
          _type: 'departmentSection',
          kind: 'applyProcedure',
          title: '합류 여정',
        },
      ],
      of: [{ type: 'departmentSection' }],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((value) => {
            if (!value) return true;
            const sections = value as { kind?: unknown }[];
            const applyProcedureCount = sections.filter(
              (section) => section.kind === 'applyProcedure',
            ).length;
            return applyProcedureCount <= 1
              ? true
              : '합류 여정 섹션은 한 개만 추가할 수 있습니다.';
          }),
    }),
  ],
  preview: {
    select: {
      title: 'basicInformation.name',
      media: 'basicInformation.icon',
    },
  },
});
