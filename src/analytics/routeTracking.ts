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
  onPostHogSessionId,
  registerSessionProperties,
} from '@/analytics/posthog';
import {
  resetScrollDepthTracking,
  type ScrollRouteContext,
} from '@/analytics/scrollDepth';
import {
  initializeSessionUtm,
  type LandingUtmProperties,
  type SessionStorageLike,
  type SessionUtm,
} from '@/analytics/utm';
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

interface SessionUtmHandlers {
  getSearch(): string;
  getStorage(): SessionStorageLike;
  landingPageViewed(properties: LandingUtmProperties): void;
  registerSessionProperties(properties: SessionUtm): void;
}

export function createRouteEventTracker(handlers: RouteEventHandlers) {
  let lastPathname: string | undefined;

  return (location: RouteLocation, context: RouteAnalyticsContext = {}) => {
    const pathname = normalizePathname(location.pathname);
    if (pathname === lastPathname) return false;

    const pageType = classifyPage(pathname);
    const recruitmentCycleId = context.recruitmentCycleId;
    lastPathname = pathname;
    handlers.pageViewed(pageType, location, recruitmentCycleId);

    switch (pageType) {
      case 'main':
        handlers.mainPageViewed();
        break;
      case 'recruiting': {
        if (recruitmentCycleId) {
          handlers.recruitingPageViewed(recruitmentCycleId);
        }
        break;
      }
      case 'jd': {
        if (recruitmentCycleId) {
          handlers.jdPageViewed(
            getJdTeamNameFromPathname(pathname),
            recruitmentCycleId,
          );
        }
        break;
      }
    }

    return true;
  };
}

export function createSessionUtmSynchronizer(handlers: SessionUtmHandlers) {
  let lastSessionId: string | undefined;

  return (sessionId: string) => {
    if (!sessionId || sessionId === lastSessionId) return false;

    // Set this before capturing landing_page_viewed. That capture re-enters
    // PostHog's session lookup and must not initialize the same session twice.
    lastSessionId = sessionId;
    const sessionUtm = initializeSessionUtm(
      handlers.getSearch(),
      handlers.getStorage(),
      sessionId,
    );
    handlers.registerSessionProperties(sessionUtm.sessionProperties);
    if (sessionUtm.isFirstEntry && sessionUtm.landingProperties) {
      handlers.landingPageViewed(sessionUtm.landingProperties);
    }

    return true;
  };
}

export function getScrollRouteContext(
  pageType: PageType,
  pathname: string,
  recruitmentCycleId?: string,
): ScrollRouteContext {
  switch (pageType) {
    case 'main':
      return { pageType };
    case 'recruiting':
      return recruitmentCycleId
        ? { pageType, recruitmentCycleId }
        : { pageType: 'other' };
    case 'jd':
      return recruitmentCycleId
        ? {
            pageType,
            recruitmentCycleId,
            teamName: getJdTeamNameFromPathname(pathname),
          }
        : { pageType: 'other' };
    case 'other':
      return { pageType };
  }
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
let sessionUtmSubscriptionInitialized = false;

const synchronizeSessionUtm = createSessionUtmSynchronizer({
  getSearch: () => window.location.search,
  getStorage: getSessionStorage,
  landingPageViewed: trackLandingPageViewed,
  registerSessionProperties,
});

export function trackRouteUpdate(location: RouteLocation) {
  if (!initPostHog()) return;

  if (!sessionUtmSubscriptionInitialized) {
    sessionUtmSubscriptionInitialized =
      onPostHogSessionId(synchronizeSessionUtm) !== undefined;
  }
  const sessionId = getPostHogSessionId();
  if (sessionId) synchronizeSessionUtm(sessionId);

  const pageType = classifyPage(location.pathname);
  const recruitmentCycleId =
    pageType === 'jd' || pageType === 'recruiting'
      ? getRenderedRecruitmentCycleId()
      : undefined;
  if (!trackRouteEvent(location, { recruitmentCycleId })) return;
  resetScrollDepthTracking(
    getScrollRouteContext(pageType, location.pathname, recruitmentCycleId),
  );
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
