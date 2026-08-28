import posthog, { type Properties } from 'posthog-js';

import {
  type AnalyticsEnvironment,
  getAnalyticsConfig,
} from '@/analytics/config';
import { TRACKING_SOURCE, TRACKING_VERSION } from '@/analytics/contracts';
import { sanitizeCapturedUrls } from '@/analytics/url';

type AnalyticsState = 'disabled' | 'initialized' | 'uninitialized';

const GLOBAL_STATE_KEY = '__yourssuPostHogNativeState';

function getGlobalState(): AnalyticsState {
  return ((globalThis as Record<string, unknown>)[GLOBAL_STATE_KEY] ??
    'uninitialized') as AnalyticsState;
}

function setGlobalState(state: AnalyticsState) {
  (globalThis as Record<string, unknown>)[GLOBAL_STATE_KEY] = state;
}

function getBrowserAnalyticsEnvironment(): AnalyticsEnvironment {
  // Gatsby only exposes GATSBY_* variables that are referenced directly.
  // Passing process.env as a whole is compiled to an empty object in the browser.
  return {
    GATSBY_APP_POSTHOG_DEPLOYMENT_ENV:
      process.env.GATSBY_APP_POSTHOG_DEPLOYMENT_ENV,
    GATSBY_APP_POSTHOG_HOST: process.env.GATSBY_APP_POSTHOG_HOST,
    GATSBY_APP_POSTHOG_KEY: process.env.GATSBY_APP_POSTHOG_KEY,
    GATSBY_APP_POSTHOG_NATIVE_CAPTURE_ENABLED:
      process.env.GATSBY_APP_POSTHOG_NATIVE_CAPTURE_ENABLED,
    GATSBY_APP_POSTHOG_PRODUCTION_CAPTURE_ENABLED:
      process.env.GATSBY_APP_POSTHOG_PRODUCTION_CAPTURE_ENABLED,
    NODE_ENV: process.env.NODE_ENV,
  };
}

export function initPostHog() {
  if (typeof window === 'undefined') return false;

  const currentState = getGlobalState();
  if (currentState === 'initialized') return true;
  if (currentState === 'disabled') return false;

  const config = getAnalyticsConfig(getBrowserAnalyticsEnvironment());
  if (!config.enabled) {
    setGlobalState('disabled');
    return false;
  }

  try {
    posthog.init(config.key, {
      api_host: config.host,
      autocapture: {
        dom_event_allowlist: ['click'],
        element_allowlist: ['a', 'button'],
      },
      before_send: sanitizeCapturedUrls,
      capture_dead_clicks: true,
      capture_pageleave: true,
      capture_pageview: false,
      defaults: '2026-01-30',
      disable_capture_url_hashes: true,
      mask_all_element_attributes: true,
      mask_all_text: true,
      mask_personal_data_properties: true,
      person_profiles: 'never',
    });
    setGlobalState('initialized');
    return true;
  } catch {
    setGlobalState('disabled');
    return false;
  }
}

export function captureNativeEvent(eventName: string, properties = {}) {
  if (!initPostHog()) return;

  posthog.capture(eventName, {
    ...(properties as Properties),
    tracking_source: TRACKING_SOURCE,
    tracking_version: TRACKING_VERSION,
  });
}

export function registerSessionProperties(properties: Properties) {
  if (!initPostHog() || Object.keys(properties).length === 0) return;
  posthog.register_for_session(properties);
}

export function getPostHogSessionId() {
  if (!initPostHog()) return undefined;

  try {
    return posthog.get_session_id();
  } catch {
    return undefined;
  }
}

export function onPostHogSessionId(callback: (sessionId: string) => void) {
  if (!initPostHog()) return undefined;

  try {
    return posthog.onSessionId(callback);
  } catch {
    return undefined;
  }
}
