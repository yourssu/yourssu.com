import './src/styles/fonts.css';
import './src/styles/global.css';

import { initPostHog } from './src/analytics/posthog';
import { trackRouteUpdate } from './src/analytics/routeTracking';

export const onClientEntry = () => {
  initPostHog();
};

export const onRouteUpdate = ({ location }) => {
  trackRouteUpdate(location);
};
