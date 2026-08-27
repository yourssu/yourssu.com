import type {
  ExternalContentType,
  JdTeamName,
  MainContentCategory,
  MainContentType,
  PageType,
  RecruitingTeamName,
  ScrollPercent,
  SocialContentType,
  TfName,
} from '@/analytics/contracts';
import { captureNativeEvent } from '@/analytics/posthog';
import type { LandingUtmProperties } from '@/analytics/utm';

export function trackLandingPageViewed(properties: LandingUtmProperties) {
  captureNativeEvent('landing_page_viewed', properties);
}

export function trackMainPageViewed() {
  captureNativeEvent('main_page_viewed');
}

export function trackMainTfCardClick(properties: { tf_name: TfName }) {
  captureNativeEvent('main_tf_card_click', properties);
}

export function trackMainRecruitingCtaClick(properties: {
  cta_label: 'apply' | 'recruiting' | 'view_positions';
  cta_location: 'bottom_cta' | 'header_nav' | 'hero';
}) {
  captureNativeEvent('main_recruiting_cta_click', properties);
}

export function trackMainRecruitingContentCardClick(properties: {
  category: MainContentCategory;
  content_type: MainContentType;
}) {
  captureNativeEvent('main_recruiting_content_card_click', properties);
}

export function trackFooterSocialIconClick(properties: {
  content_type: SocialContentType;
}) {
  captureNativeEvent('footer_social_icon_click', properties);
}

export function trackRecruitingPageViewed() {
  captureNativeEvent('recruiting_page_viewed');
}

export function trackRecruitingJdCardClick(properties: {
  team_name: RecruitingTeamName;
}) {
  captureNativeEvent('recruiting_jd_card_click', properties);
}

export function trackJdPageViewed(properties: { team_name: JdTeamName }) {
  captureNativeEvent('jd_page_viewed', properties);
}

export function trackJdApplyClick(properties: { team_name: JdTeamName }) {
  captureNativeEvent('jd_apply_click', properties);
}

export function trackJdToFaqClick(properties: { team_name: JdTeamName }) {
  captureNativeEvent('jd_to_faq_click', properties);
}

export function trackJdExternalContentCardClick(properties: {
  content_type: ExternalContentType;
  page_type: 'jd';
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_external_content_card_click', properties);
}

export function trackJdContactClick(properties: { team_name: JdTeamName }) {
  captureNativeEvent('jd_contact_click', properties);
}

export function trackFaqToggleClick(properties: {
  faq_key: string;
  page_type: PageType;
  team_name?: JdTeamName;
}) {
  captureNativeEvent('faq_toggle_click', properties);
}

export function trackMainScrollDepthReached(properties: {
  scroll_percent: ScrollPercent;
}) {
  captureNativeEvent('main_scroll_depth_reached', properties);
}

export function trackRecruitingScrollDepthReached(properties: {
  scroll_percent: ScrollPercent;
}) {
  captureNativeEvent('recruiting_scroll_depth_reached', properties);
}

export function trackJdScrollDepthReached(properties: {
  scroll_percent: ScrollPercent;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_scroll_depth_reached', properties);
}
