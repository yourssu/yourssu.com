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

interface RouteEventHandlers {
  jdPageViewed(teamName: ReturnType<typeof getJdTeamNameFromPathname>): void;
  mainPageViewed(): void;
  pageViewed(pageType: PageType, location: RouteLocation): void;
  recruitingPageViewed(): void;
}

export function createRouteEventTracker(handlers: RouteEventHandlers) {
  let lastPathname: string | undefined;

  return (location: RouteLocation) => {
    const pathname = normalizePathname(location.pathname);
    if (pathname === lastPathname) return false;
    lastPathname = pathname;

    const pageType = classifyPage(pathname);
    handlers.pageViewed(pageType, location);

    switch (pageType) {
      case 'main':
        handlers.mainPageViewed();
        break;
      case 'recruiting':
        handlers.recruitingPageViewed();
        break;
      case 'jd':
        handlers.jdPageViewed(getJdTeamNameFromPathname(pathname));
        break;
    }

    return true;
  };
}

const trackRouteEvent = createRouteEventTracker({
  jdPageViewed: (teamName) => trackJdPageViewed({ team_name: teamName }),
  mainPageViewed: trackMainPageViewed,
  pageViewed: (_pageType, location) => {
    captureNativeEvent('$pageview', {
      $current_url: getSafeCurrentUrl(location),
    });
  },
  recruitingPageViewed: trackRecruitingPageViewed,
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

  if (!trackRouteEvent(location)) return;

  const pageType = classifyPage(location.pathname);
  resetScrollDepthTracking({
    pageType,
    teamName: getJdTeamNameFromPathname(location.pathname),
  });
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
