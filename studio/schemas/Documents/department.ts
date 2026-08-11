import {MdPeople as icon} from 'react-icons/md'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'department',
  title: 'Department',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'applyProcedure',
      title: '지원 절차',
      description: '리쿠르팅을 진행하지 않는 경우, 모든 항목을 비활성화해주세요.',
      type: 'recruitingScheduleContent',
    }),
    defineField({
      title: '부서 기본 정보',
      name: 'basicInformation',
      type: 'informationContent',
    }),
    defineField({
      name: 'task',
      title: '부서 업무',
      type: 'defaultContent',
    }),
    defineField({
      name: 'growthAndDiff',
      title: '성장 및 차별점',
      type: 'defaultContent',
    }),
    defineField({
      name: 'ideal',
      title: '인재상',
      type: 'defaultContent',
    }),
    defineField({
      name: 'experience',
      title: '추천 경험',
      type: 'defaultContent',
    }),
    defineField({
      name: 'skill',
      title: '기술 스택',
      type: 'skillContent',
    }),
    defineField({
      name: 'inaWord',
      title: '한 마디',
      type: 'inaWordContent',
    }),
    defineField({
      name: 'FAQ',
      title: 'FAQ',
      type: 'FAQContent',
    }),
    defineField({
      name: 'roadToProVideo',
      title: '로드 투 프로',
      type: 'roadToProContent',
    }),
    defineField({
      name: 'medium',
      title: '미디엄',
      type: 'articleContent',
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
})
