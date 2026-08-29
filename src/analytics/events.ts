import type {
  ExternalContentType,
  FaqToggleAction,
  JdCtaLocation,
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
  content_id: string;
  content_position: number;
  content_type: MainContentType;
}) {
  captureNativeEvent('main_recruiting_content_card_click', properties);
}

export function trackFooterSocialIconClick(properties: {
  content_type: SocialContentType;
}) {
  captureNativeEvent('footer_social_icon_click', properties);
}

export function trackRecruitingPageViewed(properties: {
  recruitment_cycle_id: string;
}) {
  captureNativeEvent('recruiting_page_viewed', properties);
}

export function trackRecruitingJdCardClick(properties: {
  recruitment_cycle_id: string;
  team_name: RecruitingTeamName;
}) {
  captureNativeEvent('recruiting_jd_card_click', properties);
}

export function trackRecruitingJdCardImpression(properties: {
  card_position: number;
  recruitment_cycle_id: string;
  team_name: RecruitingTeamName;
}) {
  captureNativeEvent('recruiting_jd_card_impression', properties);
}

export function trackRecruitingContactClick(properties: {
  cta_location: 'faq_answer';
  faq_key: string;
  recruitment_cycle_id: string;
}) {
  captureNativeEvent('recruiting_contact_click', properties);
}

export function trackJdPageViewed(properties: {
  recruitment_cycle_id: string;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_page_viewed', properties);
}

export function trackJdApplyClick(properties: {
  cta_location: JdCtaLocation;
  recruitment_cycle_id: string;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_apply_click', properties);
}

export function trackJdToFaqClick(properties: {
  cta_location: JdCtaLocation;
  recruitment_cycle_id: string;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_to_faq_click', properties);
}

export function trackJdExternalContentCardClick(properties: {
  content_id: string;
  content_position: number;
  content_type: ExternalContentType;
  page_type: 'jd';
  recruitment_cycle_id: string;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_external_content_card_click', properties);
}

export function trackJdContactClick(properties: {
  cta_location: JdCtaLocation;
  recruitment_cycle_id: string;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_contact_click', properties);
}

export function trackFaqToggleClick(properties: {
  faq_key: string;
  faq_position: number;
  page_type: PageType;
  recruitment_cycle_id: string;
  team_name?: JdTeamName;
  toggle_action: FaqToggleAction;
}) {
  captureNativeEvent('faq_toggle_click', properties);
}

export function trackMainScrollDepthReached(properties: {
  scroll_percent: ScrollPercent;
}) {
  captureNativeEvent('main_scroll_depth_reached', properties);
}

export function trackRecruitingScrollDepthReached(properties: {
  recruitment_cycle_id: string;
  scroll_percent: ScrollPercent;
}) {
  captureNativeEvent('recruiting_scroll_depth_reached', properties);
}

export function trackJdScrollDepthReached(properties: {
  recruitment_cycle_id: string;
  scroll_percent: ScrollPercent;
  team_name: JdTeamName;
}) {
  captureNativeEvent('jd_scroll_depth_reached', properties);
}
