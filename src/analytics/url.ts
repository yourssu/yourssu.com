import type { CaptureResult, Properties } from 'posthog-js';

const URL_PROPERTY_NAMES = [
  '$current_url',
  '$initial_current_url',
  '$referrer',
  '$session_entry_url',
] as const;

export function getSafeCurrentUrl(location: {
  origin?: string;
  pathname: string;
}) {
  const origin = location.origin || 'https://yourssu.com';
  return `${origin}${location.pathname}`;
}

export function sanitizeCapturedUrls(
  captureResult: CaptureResult | null,
): CaptureResult | null {
  if (!captureResult) return null;

  const properties: Properties = { ...captureResult.properties };
  for (const propertyName of URL_PROPERTY_NAMES) {
    const value = properties[propertyName];
    if (typeof value === 'string') {
      properties[propertyName] = stripUrlQueryAndHash(value);
    }
  }

  return { ...captureResult, properties };
}

function stripUrlQueryAndHash(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}
