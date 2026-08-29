import {
  planAnalyticsMetadata,
  type AnalyticsMetadataPlan,
  type RawDocument,
} from './lib';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const expectAbort = (document: RawDocument, expectedText: string) => {
  let caught: unknown;
  try {
    planAnalyticsMetadata(document);
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof Error && caught.message.includes(expectedText),
    caught instanceof Error
      ? caught.message
      : `Expected migration to abort with "${expectedText}".`,
  );
};

const applyPlan = (
  document: RawDocument,
  plan: AnalyticsMetadataPlan,
): RawDocument => ({
  ...document,
  ...(plan.setDepartmentAnalytics && plan.setDepartmentSlug
    ? {
        basicInformation: {
          ...(document.basicInformation as Record<string, unknown>),
          analytics: plan.setDepartmentAnalytics,
          slug: plan.setDepartmentSlug,
        },
      }
    : {}),
  ...(plan.setProductItems
    ? {
        product: {
          ...(document.product as Record<string, unknown>),
          items: plan.setProductItems,
        },
      }
    : {}),
  ...(plan.setChannelItems
    ? {
        channel: {
          ...(document.channel as Record<string, unknown>),
          items: plan.setChannelItems,
        },
      }
    : {}),
  ...(plan.setFaqItems
    ? {
        faq: {
          ...(document.faq as Record<string, unknown>),
          items: plan.setFaqItems,
        },
      }
    : {}),
});

const mainPage: RawDocument = {
  _id: 'mainPage',
  _type: 'mainPage',
  channel: {
    items: [
      { _key: 'oklch', title: '현재 콘텐츠' },
      { _key: 'ios-story', title: 'iOS 콘텐츠' },
      { _key: 'one-team', title: 'HR 콘텐츠' },
      { _key: 'f66406c00167', title: '영상 콘텐츠' },
    ],
  },
  product: {
    items: [
      { _key: 'signal', title: 'Signal' },
      { _key: 'usaint', title: '유세인트' },
      { _key: 'ssu-time', title: 'SSU-TIME' },
    ],
  },
};

const mainSnapshot = JSON.stringify(mainPage);
const mainPlan = planAnalyticsMetadata(mainPage);
assert(mainPlan.shouldPatch, 'legacy mainPage must require a patch');
assert(
  JSON.stringify(mainPage) === mainSnapshot,
  'planner must not mutate data',
);
assert(
  mainPlan.setProductItems?.find(({ _key }) => _key === 'usaint')
    ?.analyticsTfName === 'soongsil_life',
  'product TF values must be backfilled',
);
assert(
  mainPlan.setChannelItems?.find(({ _key }) => _key === 'oklch')
    ?.analyticsCategory === 'none',
  'repurposed content must keep the empty event category through CMS none',
);
assert(
  !planAnalyticsMetadata(applyPlan(mainPage, mainPlan)).shouldPatch,
  'mainPage migration rerun must be a no-op',
);

const departments = [
  ['Android Engineer', 'android_engineer', 'android', 'android'],
  ['Product Manager', 'product_manager', 'pm', 'none'],
  ['Backend Engineer', 'backend_engineer', 'backend', 'none'],
  ['Product Designer', 'product_designer', 'design', 'design'],
  ['Frontend Engineer', 'frontend_engineer', 'frontend', 'frontend'],
  ['HR Partner', 'hr_partner', 'hr', 'hr'],
  ['Legal Partner', 'legal_partner', 'legal', 'legal'],
  ['Marketer', 'marketer', 'marketing', 'marketing'],
  ['iOS Engineer', 'ios_engineer', 'ios', 'ios'],
] as const;

for (const [name, slug, recruitingTeamName, jdTeamName] of departments) {
  const department: RawDocument = {
    _id: `department.${slug}`,
    _type: 'department',
    basicInformation: { name },
  };
  const plan = planAnalyticsMetadata(department);
  assert(plan.shouldPatch, `${name} must require a patch`);
  const basicInformation = {
    analytics: plan.setDepartmentAnalytics,
    slug: plan.setDepartmentSlug,
  } as Record<string, unknown>;
  assert(
    (basicInformation.slug as Record<string, unknown>).current === slug,
    `${name} must receive a stable slug`,
  );
  const analytics = basicInformation.analytics as Record<string, unknown>;
  assert(
    analytics.recruitingTeamName === recruitingTeamName &&
      analytics.jdTeamName === jdTeamName,
    `${name} must preserve both event team contracts`,
  );
  assert(
    !planAnalyticsMetadata(applyPlan(department, plan)).shouldPatch,
    `${name} migration rerun must be a no-op`,
  );
}

assert(
  !planAnalyticsMetadata({
    _id: 'department.new-team',
    _type: 'department',
    basicInformation: {
      analytics: {
        _type: 'departmentAnalytics',
        jdTeamName: 'none',
        recruitingTeamName: 'design',
      },
      name: 'Renamed Team',
      slug: { _type: 'slug', current: 'stable_team_slug' },
    },
  }).shouldPatch,
  'new or renamed departments with explicit metadata must not need code mapping',
);

const recruitingPage: RawDocument = {
  _id: 'recruitingPage',
  _type: 'recruitingPage',
  faq: {
    items: [
      {
        _key: 'faq-11',
        link: {
          _type: 'recruitingPageFaqLink',
          href: 'https://example.com/contact',
          label: '문의하기',
        },
        question: '문의는 어디서 하나요?',
      },
      { _key: 'plain-last', question: '일반 질문' },
    ],
  },
};
const faqPlan = planAnalyticsMetadata(recruitingPage);
assert(
  ((faqPlan.setFaqItems?.[0].link as Record<string, unknown>)
    ?.analyticsAction as unknown) === 'contact',
  'the contact action must follow the link instead of the last array position',
);
assert(
  !planAnalyticsMetadata(applyPlan(recruitingPage, faqPlan)).shouldPatch,
  'FAQ migration rerun must be a no-op',
);

expectAbort(
  {
    _id: 'mainPage',
    _type: 'mainPage',
    product: { items: [{ _key: 'new-product' }] },
    channel: { items: [] },
  },
  'new-product.analyticsTfName is missing',
);
expectAbort(
  {
    _id: 'mainPage',
    _type: 'mainPage',
    product: { items: [] },
    channel: {
      items: [
        {
          _key: 'partial',
          analyticsCategory: 'ios',
        },
      ],
    },
  },
  'partial analytics metadata',
);
expectAbort(
  {
    _id: 'department.unknown',
    _type: 'department',
    basicInformation: { name: 'Unknown Team' },
  },
  'analytics metadata is missing for "Unknown Team"',
);
expectAbort(
  {
    _id: 'recruitingPage',
    _type: 'recruitingPage',
    faq: {
      items: [
        { _key: 'one', link: {} },
        { _key: 'two', link: {} },
      ],
    },
  },
  'need an explicit analyticsAction',
);
expectAbort(
  {
    _id: 'recruitingPage',
    _type: 'recruitingPage',
    faq: { items: [{ _key: 'new-link', link: {} }] },
  },
  'must be set explicitly',
);
expectAbort(
  {
    _id: 'drafts.department.product_designer',
    _type: 'department',
    basicInformation: { name: 'Product Designer' },
  },
  'draft documents must be published or discarded first',
);

process.stdout.write('SPR-124 analytics metadata migration check passed\n');
