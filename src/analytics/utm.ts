const SESSION_UTM_STORAGE_KEY = 'yourssu.posthog.session-utm.v1';

const UTM_PARAMETER_NAMES = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

type UtmParameterName = (typeof UTM_PARAMETER_NAMES)[number];

export type SessionUtm = Partial<Record<UtmParameterName, string>>;

export interface LandingUtmProperties {
  campaign: string;
  content: string;
  medium: string;
  source: string;
  term: string;
}

export interface SessionUtmResult {
  isFirstEntry: boolean;
  landingProperties?: LandingUtmProperties;
  sessionProperties: SessionUtm;
}

export interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StoredSessionUtm {
  properties: SessionUtm;
  sessionId: string;
}

export function initializeSessionUtm(
  search: string,
  storage: SessionStorageLike,
  sessionId: string,
): SessionUtmResult {
  const storedValue = storage.getItem(SESSION_UTM_STORAGE_KEY);
  if (storedValue !== null) {
    const storedSession = parseStoredUtm(storedValue);
    if (storedSession?.sessionId === sessionId) {
      return {
        isFirstEntry: false,
        sessionProperties: storedSession.properties,
      };
    }
  }

  const parameters = new URLSearchParams(search);
  const sessionProperties = readSessionProperties(parameters);
  storage.setItem(
    SESSION_UTM_STORAGE_KEY,
    JSON.stringify({ properties: sessionProperties, sessionId }),
  );

  const source = sessionProperties.utm_source;
  return {
    isFirstEntry: true,
    landingProperties: source
      ? {
          campaign: sessionProperties.utm_campaign ?? '',
          content: sessionProperties.utm_content ?? '',
          medium: sessionProperties.utm_medium ?? '',
          source,
          term: sessionProperties.utm_term ?? '',
        }
      : undefined,
    sessionProperties,
  };
}

function parseStoredUtm(value: string): StoredSessionUtm | undefined {
  try {
    const parsedValue: unknown = JSON.parse(value);
    if (!parsedValue || typeof parsedValue !== 'object') return undefined;

    const sessionId = (parsedValue as Record<string, unknown>).sessionId;
    const properties = (parsedValue as Record<string, unknown>).properties;
    if (
      typeof sessionId !== 'string' ||
      !properties ||
      typeof properties !== 'object'
    ) {
      return undefined;
    }

    return {
      properties: Object.fromEntries(
        UTM_PARAMETER_NAMES.flatMap((name) => {
          const property = (properties as Record<string, unknown>)[name];
          return typeof property === 'string' && property
            ? [[name, property]]
            : [];
        }),
      ),
      sessionId,
    };
  } catch {
    return undefined;
  }
}

function readSessionProperties(parameters: URLSearchParams): SessionUtm {
  return Object.fromEntries(
    UTM_PARAMETER_NAMES.flatMap((name) => {
      const value = normalizeUtmValue(parameters.get(name));
      return value ? [[name, value]] : [];
    }),
  );
}

function normalizeUtmValue(value: string | null) {
  if (!value) return '';
  return [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 31 && codePoint !== 127;
    })
    .join('')
    .trim()
    .slice(0, 200);
}
