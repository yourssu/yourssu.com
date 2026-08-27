export type AnalyticsDeploymentEnvironment =
  | 'development'
  | 'staging'
  | 'production';

export interface AnalyticsEnvironment {
  GATSBY_APP_POSTHOG_DEPLOYMENT_ENV?: string;
  GATSBY_APP_POSTHOG_HOST?: string;
  GATSBY_APP_POSTHOG_KEY?: string;
  GATSBY_APP_POSTHOG_NATIVE_CAPTURE_ENABLED?: string;
  GATSBY_APP_POSTHOG_PRODUCTION_CAPTURE_ENABLED?: string;
  NODE_ENV?: string;
}

interface EnabledAnalyticsConfig {
  deploymentEnvironment: AnalyticsDeploymentEnvironment;
  enabled: true;
  host: string;
  key: string;
}

interface DisabledAnalyticsConfig {
  deploymentEnvironment: AnalyticsDeploymentEnvironment;
  enabled: false;
  reason:
    | 'invalid_host'
    | 'missing_configuration'
    | 'native_capture_disabled'
    | 'production_safety_lock';
}

export type AnalyticsConfig = DisabledAnalyticsConfig | EnabledAnalyticsConfig;

function getDeploymentEnvironment(
  environment: AnalyticsEnvironment,
): AnalyticsDeploymentEnvironment {
  const explicitEnvironment =
    environment.GATSBY_APP_POSTHOG_DEPLOYMENT_ENV?.toLowerCase();

  if (
    explicitEnvironment === 'development' ||
    explicitEnvironment === 'staging' ||
    explicitEnvironment === 'production'
  ) {
    return explicitEnvironment;
  }

  return environment.NODE_ENV === 'production' ? 'production' : 'development';
}

function isValidHost(
  host: string,
  deploymentEnvironment: AnalyticsDeploymentEnvironment,
) {
  try {
    const url = new URL(host);
    if (url.username || url.password || url.search || url.hash) return false;

    if (deploymentEnvironment === 'production') {
      return url.protocol === 'https:';
    }

    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getAnalyticsConfig(
  environment: AnalyticsEnvironment,
): AnalyticsConfig {
  const deploymentEnvironment = getDeploymentEnvironment(environment);

  if (environment.GATSBY_APP_POSTHOG_NATIVE_CAPTURE_ENABLED !== 'true') {
    return {
      deploymentEnvironment,
      enabled: false,
      reason: 'native_capture_disabled',
    };
  }

  if (
    deploymentEnvironment === 'production' &&
    environment.GATSBY_APP_POSTHOG_PRODUCTION_CAPTURE_ENABLED !== 'true'
  ) {
    return {
      deploymentEnvironment,
      enabled: false,
      reason: 'production_safety_lock',
    };
  }

  const host = environment.GATSBY_APP_POSTHOG_HOST?.trim();
  const key = environment.GATSBY_APP_POSTHOG_KEY?.trim();
  if (!host || !key) {
    return {
      deploymentEnvironment,
      enabled: false,
      reason: 'missing_configuration',
    };
  }

  if (!isValidHost(host, deploymentEnvironment)) {
    return {
      deploymentEnvironment,
      enabled: false,
      reason: 'invalid_host',
    };
  }

  return { deploymentEnvironment, enabled: true, host, key };
}
