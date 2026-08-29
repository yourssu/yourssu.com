import {
  classifyPage,
  normalizePathname,
  type JdTeamName,
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
import { isOneOf, JD_TEAM_NAMES } from '../../shared/analyticsMetadata';

interface RouteLocation {
  origin?: string;
  pathname: string;
  search?: string;
}

interface RouteAnalyticsContext {
  jdTeamName?: JdTeamName;
  recruitmentCycleId?: string;
}

interface RouteEventHandlers {
  jdPageViewed(teamName: JdTeamName, recruitmentCycleId: string): void;
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
    const jdTeamName = context.jdTeamName;
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
        if (recruitmentCycleId && jdTeamName) {
          handlers.jdPageViewed(jdTeamName, recruitmentCycleId);
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
  recruitmentCycleId?: string,
  jdTeamName?: JdTeamName,
): ScrollRouteContext {
  switch (pageType) {
    case 'main':
      return { pageType };
    case 'recruiting':
      return recruitmentCycleId
        ? { pageType, recruitmentCycleId }
        : { pageType: 'other' };
    case 'jd':
      return recruitmentCycleId && jdTeamName
        ? {
            pageType,
            recruitmentCycleId,
            teamName: jdTeamName,
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
  const renderedContext =
    pageType === 'jd' || pageType === 'recruiting'
      ? getRenderedRouteAnalyticsContext()
      : {};
  if (!trackRouteEvent(location, renderedContext)) return;
  resetScrollDepthTracking(
    getScrollRouteContext(
      pageType,
      renderedContext.recruitmentCycleId,
      renderedContext.jdTeamName,
    ),
  );
}

function getRenderedRouteAnalyticsContext(): RouteAnalyticsContext {
  const element = document.querySelector<HTMLElement>(
    '[data-recruitment-cycle-id]',
  );
  const recruitmentCycleId = element?.dataset.recruitmentCycleId?.trim();
  const teamName = element?.dataset.analyticsTeamName?.trim();
  return {
    ...(recruitmentCycleId ? { recruitmentCycleId } : {}),
    ...(isOneOf(JD_TEAM_NAMES, teamName) ? { jdTeamName: teamName } : {}),
  };
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
