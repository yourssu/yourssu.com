import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getAnalyticsConfig } from '@/analytics/config';
import {
  classifyPage,
  getJdTeamNameFromDepartmentName,
  getJdTeamNameFromPathname,
  getMainContentAnalytics,
  getRecruitingTeamName,
  getTfName,
} from '@/analytics/contracts';
import { createRouteEventTracker } from '@/analytics/routeTracking';
import { createScrollThresholdTracker } from '@/analytics/scrollDepth';
import { initializeSessionUtm, type SessionStorageLike } from '@/analytics/utm';
import { sanitizeCapturedUrls } from '@/analytics/url';

const configuredEnvironment = {
  GATSBY_APP_POSTHOG_HOST: 'https://example.invalid',
  GATSBY_APP_POSTHOG_KEY: 'test-key',
  GATSBY_APP_POSTHOG_NATIVE_CAPTURE_ENABLED: 'true',
};

class MemorySessionStorage implements SessionStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test('the explicit event API contains the complete 17-event contract', () => {
  const source = readFileSync(new URL('./events.ts', import.meta.url), 'utf8');
  const capturedEventNames = [
    ...source.matchAll(/captureNativeEvent\('([^']+)'/g),
  ]
    .map((match) => match[1])
    .sort();

  assert.deepEqual(capturedEventNames, [
    'faq_toggle_click',
    'footer_social_icon_click',
    'jd_apply_click',
    'jd_contact_click',
    'jd_external_content_card_click',
    'jd_page_viewed',
    'jd_scroll_depth_reached',
    'jd_to_faq_click',
    'landing_page_viewed',
    'main_page_viewed',
    'main_recruiting_content_card_click',
    'main_recruiting_cta_click',
    'main_scroll_depth_reached',
    'main_tf_card_click',
    'recruiting_jd_card_click',
    'recruiting_page_viewed',
    'recruiting_scroll_depth_reached',
  ]);
});

test('capture is opt-in and production has an independent safety lock', () => {
  assert.deepEqual(getAnalyticsConfig({ NODE_ENV: 'development' }), {
    deploymentEnvironment: 'development',
    enabled: false,
    reason: 'native_capture_disabled',
  });

  assert.equal(
    getAnalyticsConfig({
      ...configuredEnvironment,
      NODE_ENV: 'development',
    }).enabled,
    true,
  );

  assert.deepEqual(
    getAnalyticsConfig({ ...configuredEnvironment, NODE_ENV: 'production' }),
    {
      deploymentEnvironment: 'production',
      enabled: false,
      reason: 'production_safety_lock',
    },
  );

  assert.equal(
    getAnalyticsConfig({
      ...configuredEnvironment,
      GATSBY_APP_POSTHOG_PRODUCTION_CAPTURE_ENABLED: 'true',
      NODE_ENV: 'production',
    }).enabled,
    true,
  );
});

test('staging can capture without opening the production lock', () => {
  assert.equal(
    getAnalyticsConfig({
      ...configuredEnvironment,
      GATSBY_APP_POSTHOG_DEPLOYMENT_ENV: 'staging',
      NODE_ENV: 'production',
    }).enabled,
    true,
  );
});

test('page and team mappings preserve the GTM contract and omissions', () => {
  assert.equal(classifyPage('/'), 'main');
  assert.equal(classifyPage('/recruiting/'), 'recruiting');
  assert.equal(classifyPage('/recruiting/product_designer/'), 'jd');
  assert.equal(classifyPage('/404/'), 'other');

  assert.equal(getRecruitingTeamName('Product Manager'), 'pm');
  assert.equal(getRecruitingTeamName('Backend Engineer'), 'backend');
  assert.equal(
    getJdTeamNameFromPathname('/recruiting/product_designer'),
    'design',
  );
  assert.equal(
    getJdTeamNameFromDepartmentName('Frontend Engineer'),
    'frontend',
  );

  // These two values exist for recruiting-card clicks but are intentionally
  // excluded from the historical JD URL mapping.
  assert.equal(
    getJdTeamNameFromPathname('/recruiting/product_manager'),
    'none',
  );
  assert.equal(
    getJdTeamNameFromPathname('/recruiting/backend_engineer'),
    'none',
  );
});

test('Sanity keys map cards without inspecting rendered text or URLs', () => {
  assert.equal(getTfName('ssu-time'), 'ssutime');
  assert.equal(getTfName('usaint'), 'soongsil_life');
  assert.equal(getTfName('signal'), 'signal');
  assert.deepEqual(getMainContentAnalytics('ios-story'), {
    category: 'ios',
    content_type: 'instagram',
  });
  assert.equal(getMainContentAnalytics('unknown'), undefined);
});

test('UTM context is captured from the first entry and retained for the tab session', () => {
  const storage = new MemorySessionStorage();
  const first = initializeSessionUtm(
    '?utm_source=Newsletter&utm_medium=email&utm_campaign=fall&utm_term=&utm_content=hero',
    storage,
    'session-1',
  );

  assert.deepEqual(first, {
    isFirstEntry: true,
    landingProperties: {
      campaign: 'fall',
      content: 'hero',
      medium: 'email',
      source: 'Newsletter',
      term: '',
    },
    sessionProperties: {
      utm_campaign: 'fall',
      utm_content: 'hero',
      utm_medium: 'email',
      utm_source: 'Newsletter',
    },
  });

  const later = initializeSessionUtm(
    '?utm_source=overwritten',
    storage,
    'session-1',
  );
  assert.equal(later.isFirstEntry, false);
  assert.deepEqual(later.sessionProperties, first.sessionProperties);
  assert.equal(later.landingProperties, undefined);
});

test('an initial direct entry is not contaminated by a later UTM URL', () => {
  const storage = new MemorySessionStorage();
  assert.deepEqual(initializeSessionUtm('', storage, 'session-1'), {
    isFirstEntry: true,
    landingProperties: undefined,
    sessionProperties: {},
  });
  assert.deepEqual(
    initializeSessionUtm('?utm_source=later', storage, 'session-1'),
    {
      isFirstEntry: false,
      sessionProperties: {},
    },
  );
});

test('a new PostHog session starts a fresh UTM context', () => {
  const storage = new MemorySessionStorage();
  initializeSessionUtm('?utm_source=first', storage, 'session-1');

  assert.deepEqual(
    initializeSessionUtm('?utm_source=second', storage, 'session-2'),
    {
      isFirstEntry: true,
      landingProperties: {
        campaign: '',
        content: '',
        medium: '',
        source: 'second',
        term: '',
      },
      sessionProperties: { utm_source: 'second' },
    },
  );
});

test('route tracking fires once per pathname and fires again after returning', () => {
  const captured: string[] = [];
  const trackRoute = createRouteEventTracker({
    jdPageViewed: (teamName) => captured.push(`jd:${teamName}`),
    mainPageViewed: () => captured.push('main'),
    pageViewed: (pageType) => captured.push(`$pageview:${pageType}`),
    recruitingPageViewed: () => captured.push('recruiting'),
  });

  assert.equal(trackRoute({ pathname: '/', search: '?utm_source=test' }), true);
  assert.equal(trackRoute({ pathname: '/', search: '?different=true' }), false);
  assert.equal(trackRoute({ pathname: '/recruiting/' }), true);
  assert.equal(trackRoute({ pathname: '/recruiting/product_designer' }), true);
  assert.equal(trackRoute({ pathname: '/' }), true);

  assert.deepEqual(captured, [
    '$pageview:main',
    'main',
    '$pageview:recruiting',
    'recruiting',
    '$pageview:jd',
    'jd:design',
    '$pageview:main',
    'main',
  ]);
});

test('scroll thresholds fire once in ascending order even when crossed together', () => {
  const captured: number[] = [];
  const tracker = createScrollThresholdTracker((threshold) =>
    captured.push(threshold),
  );

  tracker.check(49);
  tracker.check(71);
  tracker.check(95);
  tracker.check(100);
  assert.deepEqual(captured, [50, 70, 90]);
});

test('captured URL properties never include query strings or hashes', () => {
  const sanitized = sanitizeCapturedUrls({
    event: '$pageview',
    properties: {
      $current_url:
        'https://yourssu.com/recruiting/?email=user@example.com#faq',
      untouched: 'value',
    },
    uuid: '00000000-0000-4000-8000-000000000000',
  });

  assert.equal(
    sanitized?.properties.$current_url,
    'https://yourssu.com/recruiting/',
  );
  assert.equal(sanitized?.properties.untouched, 'value');
});
