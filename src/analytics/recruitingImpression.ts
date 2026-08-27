import {
  normalizePathname,
  type RecruitingTeamName,
} from '@/analytics/contracts';
import { trackRecruitingJdCardImpression } from '@/analytics/events';

export const RECRUITING_JD_CARD_IMPRESSION_THRESHOLD = 0.5;

interface ImpressionCandidate {
  cardId: string;
  intersectionRatio: number;
  isIntersecting: boolean;
  pathname: string;
}

export function createRecruitingJdCardImpressionTracker() {
  const capturedCards = new Set<string>();

  return {
    shouldCapture(candidate: ImpressionCandidate) {
      if (
        !candidate.isIntersecting ||
        candidate.intersectionRatio < RECRUITING_JD_CARD_IMPRESSION_THRESHOLD
      ) {
        return false;
      }

      const cardKey = JSON.stringify([
        normalizePathname(candidate.pathname),
        candidate.cardId,
      ]);
      if (capturedCards.has(cardKey)) return false;

      capturedCards.add(cardKey);
      return true;
    },
  };
}

const recruitingJdCardImpressionTracker =
  createRecruitingJdCardImpressionTracker();

export function observeRecruitingJdCardImpression(
  element: Element,
  context: {
    cardId: string;
    cardPosition: number;
    recruitmentCycleId: string;
    teamName: RecruitingTeamName;
  },
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (
          entry.target !== element ||
          !recruitingJdCardImpressionTracker.shouldCapture({
            cardId: context.cardId,
            intersectionRatio: entry.intersectionRatio,
            isIntersecting: entry.isIntersecting,
            pathname: window.location.pathname,
          })
        ) {
          continue;
        }

        trackRecruitingJdCardImpression({
          card_position: context.cardPosition,
          recruitment_cycle_id: context.recruitmentCycleId,
          team_name: context.teamName,
        });
        observer.unobserve(element);
      }
    },
    { threshold: RECRUITING_JD_CARD_IMPRESSION_THRESHOLD },
  );

  observer.observe(element);
  return () => observer.disconnect();
}
