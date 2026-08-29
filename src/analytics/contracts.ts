import type { MainContentType } from '../../shared/analyticsMetadata';

export type {
  JdTeamName,
  MainContentType,
  RecruitingTeamName,
  TfName,
} from '../../shared/analyticsMetadata';

export const TRACKING_SOURCE = 'native' as const;
export const TRACKING_VERSION = 2 as const;

export type PageType = 'jd' | 'main' | 'other' | 'recruiting';

export type SocialContentType = 'github' | 'instagram' | 'kakao' | 'medium';
export type ExternalContentType = 'medium' | 'youtube';
export type MainContentCategory = '' | 'design' | 'hr' | 'ios';
export type ScrollPercent = 50 | 70 | 90;
export type FaqToggleAction = 'close' | 'open';
export type JdCtaLocation = 'desktop_sidebar' | 'mobile_sticky';

export interface MainContentAnalytics {
  category: MainContentCategory;
  content_type: MainContentType;
}

export function classifyPage(pathname: string): PageType {
  const normalizedPathname = normalizePathname(pathname);
  if (normalizedPathname === '/') return 'main';
  if (normalizedPathname === '/recruiting') return 'recruiting';
  if (normalizedPathname.startsWith('/recruiting/')) return 'jd';
  return 'other';
}

export function getFaqToggleAction(
  currentState: string | undefined,
): FaqToggleAction | undefined {
  if (currentState === 'closed') return 'open';
  if (currentState === 'open') return 'close';
  return undefined;
}

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return `/${pathname.split('/').filter(Boolean).join('/')}`;
}
