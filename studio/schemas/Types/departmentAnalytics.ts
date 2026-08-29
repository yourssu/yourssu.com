import { defineField, defineType } from 'sanity';

import {
  JD_TEAM_NAMES,
  RECRUITING_TEAM_NAMES,
} from '../../../shared/analyticsMetadata';

const teamOptions = (values: readonly string[]) =>
  values.map((value) => ({ title: value, value }));

export default defineType({
  name: 'departmentAnalytics',
  title: '분석 메타데이터',
  type: 'object',
  fields: [
    defineField({
      name: 'recruitingTeamName',
      title: '리크루팅 카드 팀 값',
      description:
        'PostHog의 recruiting_jd_card_* 이벤트에 저장되는 고정 값입니다.',
      type: 'string',
      options: { list: teamOptions(RECRUITING_TEAM_NAMES) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'jdTeamName',
      title: 'JD 팀 값',
      description:
        'PostHog의 JD 이벤트에 저장되는 고정 값입니다. 기존 정책상 PM·Backend는 none입니다.',
      type: 'string',
      options: { list: teamOptions(JD_TEAM_NAMES) },
      validation: (rule) => rule.required(),
    }),
  ],
});
