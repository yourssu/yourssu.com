import {
  FAQ_LINK_ANALYTICS_ACTIONS,
  isOneOf,
  JD_TEAM_NAMES,
  MAIN_CONTENT_CATEGORIES,
  MAIN_CONTENT_TYPES,
  RECRUITING_TEAM_NAMES,
  TF_NAMES,
  type CmsMainContentCategory,
  type JdTeamName,
  type MainContentType,
  type RecruitingTeamName,
  type TfName,
} from '../../../shared/analyticsMetadata';

export type RawDocument = {
  _id?: unknown;
  _type?: unknown;
  [key: string]: unknown;
};

type RawRecord = Record<string, unknown>;

export interface AnalyticsMetadataPlan {
  documentId: string;
  setChannelItems?: RawRecord[];
  setDepartmentAnalytics?: RawRecord;
  setDepartmentSlug?: RawRecord;
  setFaqItems?: RawRecord[];
  setProductItems?: RawRecord[];
  shouldPatch: boolean;
}

interface DepartmentBackfill {
  jdTeamName: JdTeamName;
  recruitingTeamName: RecruitingTeamName;
  slug: string;
}

interface ChannelBackfill {
  analyticsCategory: CmsMainContentCategory;
  analyticsContentType: MainContentType;
}

// These mappings are used once to enrich the content that predates the CMS
// fields. Runtime tracking never imports or consults them.
const PRODUCT_BACKFILL_BY_KEY: Record<string, TfName> = {
  signal: 'signal',
  'ssu-time': 'ssutime',
  usaint: 'soongsil_life',
};

const CHANNEL_BACKFILL_BY_KEY: Record<string, ChannelBackfill> = {
  f66406c00167: {
    analyticsCategory: 'none',
    analyticsContentType: 'youtube',
  },
  'ios-story': {
    analyticsCategory: 'ios',
    analyticsContentType: 'instagram',
  },
  oklch: {
    analyticsCategory: 'none',
    analyticsContentType: 'medium',
  },
  'one-team': {
    analyticsCategory: 'hr',
    analyticsContentType: 'youtube',
  },
};

const DEPARTMENT_BACKFILL_BY_NAME: Record<string, DepartmentBackfill> = {
  'Android Engineer': {
    jdTeamName: 'android',
    recruitingTeamName: 'android',
    slug: 'android_engineer',
  },
  'Backend Engineer': {
    jdTeamName: 'none',
    recruitingTeamName: 'backend',
    slug: 'backend_engineer',
  },
  'Frontend Engineer': {
    jdTeamName: 'frontend',
    recruitingTeamName: 'frontend',
    slug: 'frontend_engineer',
  },
  'HR Partner': {
    jdTeamName: 'hr',
    recruitingTeamName: 'hr',
    slug: 'hr_partner',
  },
  'Legal Partner': {
    jdTeamName: 'legal',
    recruitingTeamName: 'legal',
    slug: 'legal_partner',
  },
  Marketer: {
    jdTeamName: 'marketing',
    recruitingTeamName: 'marketing',
    slug: 'marketer',
  },
  'Product Designer': {
    jdTeamName: 'design',
    recruitingTeamName: 'design',
    slug: 'product_designer',
  },
  'Product Manager': {
    jdTeamName: 'none',
    recruitingTeamName: 'pm',
    slug: 'product_manager',
  },
  'iOS Engineer': {
    jdTeamName: 'ios',
    recruitingTeamName: 'ios',
    slug: 'ios_engineer',
  },
};

const LEGACY_CONTACT_FAQ_KEY = 'faq-11';

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const abort = (documentId: string, message: string): never => {
  throw new Error(
    `SPR-124 analytics metadata migration aborted: ${documentId}.${message}`,
  );
};

const documentId = (document: RawDocument): string => {
  if (typeof document._id !== 'string' || !document._id.trim()) {
    throw new Error(
      'SPR-124 analytics metadata migration aborted: document ID is missing.',
    );
  }
  return document._id as string;
};

const recordAt = (
  value: unknown,
  documentId: string,
  path: string,
): RawRecord => {
  if (!isRecord(value)) abort(documentId, `${path} must be an object`);
  return value as RawRecord;
};

const arrayAt = (
  value: unknown,
  documentId: string,
  path: string,
): RawRecord[] => {
  if (!Array.isArray(value)) abort(documentId, `${path} must be an array`);
  return (value as unknown[]).map((item, index) =>
    recordAt(item, documentId, `${path}[${index}]`),
  );
};

const keyOf = (item: RawRecord, id: string, path: string): string => {
  if (typeof item._key !== 'string' || !item._key.trim()) {
    abort(id, `${path}._key is missing`);
  }
  return item._key as string;
};

const planProductItems = (document: RawDocument, id: string) => {
  const product = recordAt(document.product, id, 'product');
  const items = arrayAt(product.items, id, 'product.items');
  let changed = false;

  const next = items.map((item, index) => {
    const key = keyOf(item, id, `product.items[${index}]`);
    if (item.analyticsTfName === undefined) {
      const backfill = PRODUCT_BACKFILL_BY_KEY[key];
      if (!backfill) {
        abort(id, `product.items.${key}.analyticsTfName is missing`);
      }
      changed = true;
      return { ...item, analyticsTfName: backfill };
    }
    if (!isOneOf(TF_NAMES, item.analyticsTfName)) {
      abort(id, `product.items.${key}.analyticsTfName is invalid`);
    }
    return item;
  });

  return changed ? next : undefined;
};

const planChannelItems = (document: RawDocument, id: string) => {
  const channel = recordAt(document.channel, id, 'channel');
  const items = arrayAt(channel.items, id, 'channel.items');
  let changed = false;

  const next = items.map((item, index) => {
    const key = keyOf(item, id, `channel.items[${index}]`);
    const categoryMissing = item.analyticsCategory === undefined;
    const contentTypeMissing = item.analyticsContentType === undefined;
    if (categoryMissing !== contentTypeMissing) {
      abort(id, `channel.items.${key} has partial analytics metadata`);
    }
    if (categoryMissing) {
      const backfill = CHANNEL_BACKFILL_BY_KEY[key];
      if (!backfill) {
        abort(id, `channel.items.${key} analytics metadata is missing`);
      }
      changed = true;
      return { ...item, ...backfill };
    }
    if (!isOneOf(MAIN_CONTENT_CATEGORIES, item.analyticsCategory)) {
      abort(id, `channel.items.${key}.analyticsCategory is invalid`);
    }
    if (!isOneOf(MAIN_CONTENT_TYPES, item.analyticsContentType)) {
      abort(id, `channel.items.${key}.analyticsContentType is invalid`);
    }
    return item;
  });

  return changed ? next : undefined;
};

const planDepartment = (document: RawDocument, id: string) => {
  const basicInformation = recordAt(
    document.basicInformation,
    id,
    'basicInformation',
  );
  const name = basicInformation.name;
  if (typeof name !== 'string' || !name.trim()) {
    abort(id, 'basicInformation.name is missing');
  }

  const hasSlug = basicInformation.slug !== undefined;
  const hasAnalytics = basicInformation.analytics !== undefined;
  if (hasSlug !== hasAnalytics) {
    abort(id, 'basicInformation has partial analytics metadata');
  }

  if (!hasSlug) {
    const departmentName = name as string;
    const backfill = DEPARTMENT_BACKFILL_BY_NAME[departmentName];
    if (!backfill) {
      abort(
        id,
        `basicInformation analytics metadata is missing for "${departmentName}"`,
      );
    }
    return {
      analytics: {
        _type: 'departmentAnalytics',
        jdTeamName: backfill.jdTeamName,
        recruitingTeamName: backfill.recruitingTeamName,
      },
      slug: { _type: 'slug', current: backfill.slug },
    };
  }

  const slug = recordAt(basicInformation.slug, id, 'basicInformation.slug');
  if (
    typeof slug.current !== 'string' ||
    !/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(slug.current)
  ) {
    abort(id, 'basicInformation.slug.current is invalid');
  }
  const analytics = recordAt(
    basicInformation.analytics,
    id,
    'basicInformation.analytics',
  );
  if (!isOneOf(RECRUITING_TEAM_NAMES, analytics.recruitingTeamName)) {
    abort(id, 'basicInformation.analytics.recruitingTeamName is invalid');
  }
  if (!isOneOf(JD_TEAM_NAMES, analytics.jdTeamName)) {
    abort(id, 'basicInformation.analytics.jdTeamName is invalid');
  }
  return undefined;
};

const planFaqItems = (document: RawDocument, id: string) => {
  const faq = recordAt(document.faq, id, 'faq');
  const items = arrayAt(faq.items, id, 'faq.items');
  const missingIndexes: number[] = [];

  items.forEach((item, index) => {
    if (item.link === undefined || item.link === null) return;
    const link = recordAt(item.link, id, `faq.items[${index}].link`);
    if (link.analyticsAction === undefined) {
      missingIndexes.push(index);
      return;
    }
    if (!isOneOf(FAQ_LINK_ANALYTICS_ACTIONS, link.analyticsAction)) {
      abort(id, `faq.items[${index}].link.analyticsAction is invalid`);
    }
  });

  if (missingIndexes.length === 0) return undefined;
  if (missingIndexes.length !== 1) {
    abort(id, 'FAQ links need an explicit analyticsAction before migration');
  }

  const targetIndex = missingIndexes[0];
  const targetKey = keyOf(items[targetIndex], id, `faq.items[${targetIndex}]`);
  if (targetKey !== LEGACY_CONTACT_FAQ_KEY) {
    abort(
      id,
      `faq.items.${targetKey}.link.analyticsAction must be set explicitly`,
    );
  }
  return items.map((item, index) => {
    if (index !== targetIndex) return item;
    return {
      ...item,
      link: {
        ...(item.link as RawRecord),
        analyticsAction: 'contact',
      },
    };
  });
};

export function planAnalyticsMetadata(
  document: RawDocument,
): AnalyticsMetadataPlan {
  const id = documentId(document);
  if (id.startsWith('drafts.')) {
    abort(id, 'draft documents must be published or discarded first');
  }

  switch (document._type) {
    case 'mainPage': {
      if (id !== 'mainPage') abort(id, 'unexpected mainPage document ID');
      const setProductItems = planProductItems(document, id);
      const setChannelItems = planChannelItems(document, id);
      return {
        documentId: id,
        ...(setProductItems ? { setProductItems } : {}),
        ...(setChannelItems ? { setChannelItems } : {}),
        shouldPatch: Boolean(setProductItems || setChannelItems),
      };
    }
    case 'department': {
      const departmentMetadata = planDepartment(document, id);
      return {
        documentId: id,
        ...(departmentMetadata
          ? {
              setDepartmentAnalytics: departmentMetadata.analytics,
              setDepartmentSlug: departmentMetadata.slug,
            }
          : {}),
        shouldPatch: Boolean(departmentMetadata),
      };
    }
    case 'recruitingPage': {
      if (id !== 'recruitingPage') {
        abort(id, 'unexpected recruitingPage document ID');
      }
      const setFaqItems = planFaqItems(document, id);
      return {
        documentId: id,
        ...(setFaqItems ? { setFaqItems } : {}),
        shouldPatch: Boolean(setFaqItems),
      };
    }
    default:
      return abort(id, `unexpected document type ${String(document._type)}`);
  }
}
