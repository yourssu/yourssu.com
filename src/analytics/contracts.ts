export const TRACKING_SOURCE = 'native' as const;
export const TRACKING_VERSION = 2 as const;

export type PageType = 'jd' | 'main' | 'other' | 'recruiting';

export type RecruitingTeamName =
  | 'android'
  | 'backend'
  | 'design'
  | 'frontend'
  | 'hr'
  | 'ios'
  | 'legal'
  | 'marketing'
  | 'pm';

export type JdTeamName =
  | 'android'
  | 'design'
  | 'frontend'
  | 'hr'
  | 'ios'
  | 'legal'
  | 'marketing'
  | 'none';

export type SocialContentType = 'github' | 'instagram' | 'kakao' | 'medium';
export type ExternalContentType = 'medium' | 'youtube';
export type MainContentCategory = '' | 'design' | 'hr' | 'ios';
export type MainContentType = 'instagram' | 'medium' | 'youtube';
export type TfName = 'signal' | 'soongsil_life' | 'ssutime';
export type ScrollPercent = 50 | 70 | 90;

const RECRUITING_TEAM_BY_DISPLAY_NAME: Record<string, RecruitingTeamName> = {
  'Android Engineer': 'android',
  'Backend Engineer': 'backend',
  'Frontend Engineer': 'frontend',
  'HR Partner': 'hr',
  'Legal Partner': 'legal',
  Marketer: 'marketing',
  'Product Designer': 'design',
  'Product Manager': 'pm',
  'iOS Engineer': 'ios',
};

// Keep this list separate from the recruiting-card map. Product Manager and
// Backend Engineer are intentionally absent from the existing JD URL policy.
const JD_TEAM_BY_SLUG: Record<string, Exclude<JdTeamName, 'none'>> = {
  android_engineer: 'android',
  frontend_engineer: 'frontend',
  hr_partner: 'hr',
  ios_engineer: 'ios',
  legal_partner: 'legal',
  marketer: 'marketing',
  product_designer: 'design',
};

export interface MainContentAnalytics {
  category: MainContentCategory;
  content_type: MainContentType;
}

// These are Sanity item keys, not rendered labels or link fragments. The empty
// category mirrors the current GTM behavior for the town-hall content card.
const MAIN_CONTENT_BY_KEY: Record<string, MainContentAnalytics> = {
  f66406c00167: { category: '', content_type: 'youtube' },
  'ios-story': { category: 'ios', content_type: 'instagram' },
  oklch: { category: 'design', content_type: 'medium' },
  'one-team': { category: 'hr', content_type: 'youtube' },
};

const TF_NAME_BY_KEY: Record<string, TfName> = {
  signal: 'signal',
  'ssu-time': 'ssutime',
  usaint: 'soongsil_life',
};

export function classifyPage(pathname: string): PageType {
  const normalizedPathname = normalizePathname(pathname);
  if (normalizedPathname === '/') return 'main';
  if (normalizedPathname === '/recruiting') return 'recruiting';
  if (normalizedPathname.startsWith('/recruiting/')) return 'jd';
  return 'other';
}

export function getJdTeamNameFromDepartmentName(name: string): JdTeamName {
  return getJdTeamNameFromSlug(name.toLowerCase().replaceAll(' ', '_'));
}

export function getJdTeamNameFromPathname(pathname: string): JdTeamName {
  const normalizedPathname = normalizePathname(pathname);
  if (!normalizedPathname.startsWith('/recruiting/')) return 'none';

  return getJdTeamNameFromSlug(
    normalizedPathname.slice('/recruiting/'.length).split('/')[0],
  );
}

export function getMainContentAnalytics(
  itemKey: string,
): MainContentAnalytics | undefined {
  return MAIN_CONTENT_BY_KEY[itemKey];
}

export function getRecruitingTeamName(
  displayName: string,
): RecruitingTeamName | undefined {
  return RECRUITING_TEAM_BY_DISPLAY_NAME[displayName];
}

export function getTfName(itemKey: string): TfName | undefined {
  return TF_NAME_BY_KEY[itemKey];
}

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return `/${pathname.split('/').filter(Boolean).join('/')}`;
}

function getJdTeamNameFromSlug(slug: string): JdTeamName {
  return JD_TEAM_BY_SLUG[slug.toLowerCase()] ?? 'none';
}
