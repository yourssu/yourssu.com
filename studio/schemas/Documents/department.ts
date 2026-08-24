import { MdPeople as icon } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

const isSectionsDocument = ({
  document,
}: {
  document?: Record<string, unknown>;
}) => document?.contentSchemaVersion === 2;

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
      name: 'contentSchemaVersion',
      type: 'number',
      hidden: true,
      readOnly: true,
      initialValue: 2,
    }),
    defineField({
      name: 'sections',
      title: '상세 섹션',
      description: '드래그해서 화면에 표시되는 순서를 변경할 수 있습니다.',
      type: 'array',
      hidden: ({ document }) => !isSectionsDocument({ document }),
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
    defineField({
      name: 'task',
      title: '부서 업무',
      type: 'defaultContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'growthAndDiff',
      title: '성장 및 차별점',
      type: 'defaultContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'ideal',
      title: '인재상',
      type: 'defaultContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'experience',
      title: '추천 경험',
      type: 'defaultContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'skill',
      title: '기술 스택',
      type: 'skillContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'inaWord',
      title: '한 마디',
      type: 'inaWordContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'FAQ',
      title: 'FAQ',
      type: 'FAQContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'roadToProVideo',
      title: '로드 투 프로',
      type: 'roadToProContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'medium',
      title: '미디엄',
      type: 'articleContent',
      hidden: isSectionsDocument,
    }),
    defineField({
      name: 'searchKeyword',
      title: '검색 키워드',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'basicInformation.name',
      media: 'basicInformation.icon',
    },
  },
});
