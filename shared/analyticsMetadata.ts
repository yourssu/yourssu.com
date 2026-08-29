export const TF_NAMES = ['signal', 'soongsil_life', 'ssutime'] as const;

export const MAIN_CONTENT_CATEGORIES = ['none', 'design', 'hr', 'ios'] as const;

export const MAIN_CONTENT_TYPES = ['instagram', 'medium', 'youtube'] as const;

export const RECRUITING_TEAM_NAMES = [
  'android',
  'backend',
  'design',
  'frontend',
  'hr',
  'ios',
  'legal',
  'marketing',
  'pm',
] as const;

// Product Manager and Backend Engineer intentionally keep `none` for JD
// events to preserve the existing analytics contract.
export const JD_TEAM_NAMES = [
  'android',
  'design',
  'frontend',
  'hr',
  'ios',
  'legal',
  'marketing',
  'none',
] as const;

export const FAQ_LINK_ANALYTICS_ACTIONS = ['contact', 'none'] as const;

export type TfName = (typeof TF_NAMES)[number];
export type CmsMainContentCategory = (typeof MAIN_CONTENT_CATEGORIES)[number];
export type MainContentType = (typeof MAIN_CONTENT_TYPES)[number];
export type RecruitingTeamName = (typeof RECRUITING_TEAM_NAMES)[number];
export type JdTeamName = (typeof JD_TEAM_NAMES)[number];
export type FaqLinkAnalyticsAction =
  (typeof FAQ_LINK_ANALYTICS_ACTIONS)[number];

export function isOneOf<T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return typeof value === 'string' && values.includes(value);
}
