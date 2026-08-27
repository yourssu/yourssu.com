import type { JdTeamName, ScrollPercent } from '@/analytics/contracts';
import {
  trackJdScrollDepthReached,
  trackMainScrollDepthReached,
  trackRecruitingScrollDepthReached,
} from '@/analytics/events';

const SCROLL_THRESHOLDS: ScrollPercent[] = [50, 70, 90];

export type ScrollRouteContext =
  | { pageType: 'jd'; recruitmentCycleId: string; teamName: JdTeamName }
  | { pageType: 'main' }
  | { pageType: 'other' }
  | { pageType: 'recruiting'; recruitmentCycleId: string };

export function createScrollThresholdTracker(
  onThresholdReached: (threshold: ScrollPercent) => void,
) {
  const reachedThresholds = new Set<ScrollPercent>();

  return {
    check(scrollPercent: number) {
      for (const threshold of SCROLL_THRESHOLDS) {
        if (scrollPercent >= threshold && !reachedThresholds.has(threshold)) {
          reachedThresholds.add(threshold);
          onThresholdReached(threshold);
        }
      }
    },
  };
}

let cancelScheduledCheck: (() => void) | undefined;
let removeScrollListener: (() => void) | undefined;

export function resetScrollDepthTracking(context: ScrollRouteContext) {
  cancelScheduledCheck?.();
  removeScrollListener?.();
  cancelScheduledCheck = undefined;
  removeScrollListener = undefined;

  if (context.pageType === 'other') return;

  const tracker = createScrollThresholdTracker((scrollPercent) => {
    switch (context.pageType) {
      case 'main':
        trackMainScrollDepthReached({ scroll_percent: scrollPercent });
        break;
      case 'recruiting':
        trackRecruitingScrollDepthReached({
          recruitment_cycle_id: context.recruitmentCycleId,
          scroll_percent: scrollPercent,
        });
        break;
      case 'jd':
        trackJdScrollDepthReached({
          recruitment_cycle_id: context.recruitmentCycleId,
          scroll_percent: scrollPercent,
          team_name: context.teamName,
        });
        break;
    }
  });

  const checkScrollDepth = () => tracker.check(getScrollPercent());
  window.addEventListener('scroll', checkScrollDepth, { passive: true });
  removeScrollListener = () =>
    window.removeEventListener('scroll', checkScrollDepth);

  const firstFrame = window.requestAnimationFrame(() => {
    const secondFrame = window.requestAnimationFrame(checkScrollDepth);
    cancelScheduledCheck = () => window.cancelAnimationFrame(secondFrame);
  });
  cancelScheduledCheck = () => window.cancelAnimationFrame(firstFrame);
}

function getScrollPercent() {
  const documentHeight = Math.max(
    document.body.offsetHeight,
    document.body.scrollHeight,
    document.documentElement.clientHeight,
    document.documentElement.offsetHeight,
    document.documentElement.scrollHeight,
  );
  const scrollableHeight = documentHeight - window.innerHeight;
  if (scrollableHeight <= 0) return 100;
  return ((window.scrollY + window.innerHeight) / documentHeight) * 100;
}
