import {
  classifyPage,
  getJdTeamNameFromPathname,
  normalizePathname,
  type PageType,
} from '@/analytics/contracts';
import {
  trackJdPageViewed,
  trackLandingPageViewed,
  trackMainPageViewed,
  trackRecruitingPageViewed,
} from '@/analytics/events';
import {
  captureNativeEvent,
  getPostHogSessionId,
  initPostHog,
  registerSessionProperties,
} from '@/analytics/posthog';
import { resetScrollDepthTracking } from '@/analytics/scrollDepth';
import { initializeSessionUtm } from '@/analytics/utm';
import { getSafeCurrentUrl } from '@/analytics/url';

interface RouteLocation {
  origin?: string;
  pathname: string;
  search?: string;
}

interface RouteAnalyticsContext {
  recruitmentCycleId?: string;
}

interface RouteEventHandlers {
  jdPageViewed(
    teamName: ReturnType<typeof getJdTeamNameFromPathname>,
    recruitmentCycleId: string,
  ): void;
  mainPageViewed(): void;
  pageViewed(
    pageType: PageType,
    location: RouteLocation,
    recruitmentCycleId?: string,
  ): void;
  recruitingPageViewed(recruitmentCycleId: string): void;
}

export function createRouteEventTracker(handlers: RouteEventHandlers) {
  let lastPathname: string | undefined;

  return (location: RouteLocation, context: RouteAnalyticsContext = {}) => {
    const pathname = normalizePathname(location.pathname);
    if (pathname === lastPathname) return false;

    const pageType = classifyPage(pathname);
    const recruitmentCycleId = context.recruitmentCycleId;
    if (
      (pageType === 'jd' || pageType === 'recruiting') &&
      !recruitmentCycleId
    ) {
      return false;
    }

    lastPathname = pathname;
    handlers.pageViewed(pageType, location, recruitmentCycleId);

    switch (pageType) {
      case 'main':
        handlers.mainPageViewed();
        break;
      case 'recruiting': {
        if (!recruitmentCycleId) return false;
        handlers.recruitingPageViewed(recruitmentCycleId);
        break;
      }
      case 'jd': {
        if (!recruitmentCycleId) return false;
        handlers.jdPageViewed(
          getJdTeamNameFromPathname(pathname),
          recruitmentCycleId,
        );
        break;
      }
    }

    return true;
  };
}

const trackRouteEvent = createRouteEventTracker({
  jdPageViewed: (teamName, recruitmentCycleId) =>
    trackJdPageViewed({
      recruitment_cycle_id: recruitmentCycleId,
      team_name: teamName,
    }),
  mainPageViewed: trackMainPageViewed,
  pageViewed: (_pageType, location, recruitmentCycleId) => {
    captureNativeEvent('$pageview', {
      $current_url: getSafeCurrentUrl(location),
      ...(recruitmentCycleId
        ? { recruitment_cycle_id: recruitmentCycleId }
        : {}),
    });
  },
  recruitingPageViewed: (recruitmentCycleId) =>
    trackRecruitingPageViewed({
      recruitment_cycle_id: recruitmentCycleId,
    }),
});

let fallbackSessionUtm: string | null = null;

export function trackRouteUpdate(location: RouteLocation) {
  if (!initPostHog()) return;

  const storage = getSessionStorage();
  const sessionUtm = initializeSessionUtm(
    location.search ?? '',
    storage,
    getPostHogSessionId() ?? 'browser-tab',
  );
  registerSessionProperties(sessionUtm.sessionProperties);
  if (sessionUtm.isFirstEntry && sessionUtm.landingProperties) {
    trackLandingPageViewed(sessionUtm.landingProperties);
  }

  const pageType = classifyPage(location.pathname);
  const recruitmentCycleId =
    pageType === 'jd' || pageType === 'recruiting'
      ? getRenderedRecruitmentCycleId()
      : undefined;
  if (!trackRouteEvent(location, { recruitmentCycleId })) return;

  switch (pageType) {
    case 'main':
      resetScrollDepthTracking({ pageType });
      break;
    case 'recruiting': {
      if (!recruitmentCycleId) return;
      resetScrollDepthTracking({
        pageType,
        recruitmentCycleId,
      });
      break;
    }
    case 'jd': {
      if (!recruitmentCycleId) return;
      resetScrollDepthTracking({
        pageType,
        recruitmentCycleId,
        teamName: getJdTeamNameFromPathname(location.pathname),
      });
      break;
    }
    case 'other':
      resetScrollDepthTracking({ pageType });
      break;
  }
}

function getRenderedRecruitmentCycleId() {
  const value = document
    .querySelector<HTMLElement>('[data-recruitment-cycle-id]')
    ?.dataset.recruitmentCycleId?.trim();
  return value || undefined;
}

function getSessionStorage() {
  try {
    const storage = window.sessionStorage;
    const probeKey = 'yourssu.posthog.storage-probe';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return {
      getItem: () => fallbackSessionUtm,
      setItem: (_key: string, value: string) => {
        fallbackSessionUtm = value;
      },
    };
  }
}
