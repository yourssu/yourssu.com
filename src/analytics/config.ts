export type AnalyticsDeploymentEnvironment =
  | 'development'
  | 'staging'
  | 'production';

export interface AnalyticsEnvironment {
  GATSBY_APP_POSTHOG_DEPLOYMENT_ENV?: string;
  GATSBY_APP_POSTHOG_KEY?: string;
  NODE_ENV?: string;
}

const POSTHOG_HOST = 'https://us.i.posthog.com';

interface EnabledAnalyticsConfig {
  deploymentEnvironment: AnalyticsDeploymentEnvironment;
  enabled: true;
  host: string;
  key: string;
}

interface DisabledAnalyticsConfig {
  deploymentEnvironment: AnalyticsDeploymentEnvironment;
  enabled: false;
  reason: 'missing_configuration';
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

export function getAnalyticsConfig(
  environment: AnalyticsEnvironment,
): AnalyticsConfig {
  const deploymentEnvironment = getDeploymentEnvironment(environment);

  const key = environment.GATSBY_APP_POSTHOG_KEY?.trim();
  if (!key) {
    return {
      deploymentEnvironment,
      enabled: false,
      reason: 'missing_configuration',
    };
  }

  return {
    deploymentEnvironment,
    enabled: true,
    host: POSTHOG_HOST,
    key,
  };
}
