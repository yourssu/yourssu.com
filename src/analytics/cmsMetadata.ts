import {
  FAQ_LINK_ANALYTICS_ACTIONS,
  isOneOf,
  JD_TEAM_NAMES,
  MAIN_CONTENT_CATEGORIES,
  MAIN_CONTENT_TYPES,
  RECRUITING_TEAM_NAMES,
  TF_NAMES,
  type FaqLinkAnalyticsAction,
  type JdTeamName,
  type RecruitingTeamName,
  type TfName,
} from '../../shared/analyticsMetadata';

import type { MainContentAnalytics } from './contracts';

type RawRecord = Record<string, unknown>;

export interface DepartmentAnalyticsMetadata {
  jdTeamName: JdTeamName;
  recruitingTeamName: RecruitingTeamName;
  slug: string;
}

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const requiredRecord = (value: unknown, path: string): RawRecord => {
  if (!isRecord(value)) {
    throw new Error(`Sanity 분석 메타데이터가 없습니다: ${path}`);
  }
  return value;
};

const requiredOption = <T extends readonly string[]>(
  value: unknown,
  values: T,
  path: string,
): T[number] => {
  if (!isOneOf(values, value)) {
    throw new Error(
      `Sanity 분석 메타데이터가 올바르지 않습니다: ${path} (${String(value)})`,
    );
  }
  return value;
};

const requiredKey = (value: unknown, path: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Sanity 항목 키가 없습니다: ${path}`);
  }
  return value;
};

const keyedItems = (rawSection: unknown, path: string) => {
  const section = requiredRecord(rawSection, path);
  if (!Array.isArray(section.items)) {
    throw new Error(`Sanity 분석 메타데이터가 없습니다: ${path}.items`);
  }

  const items = new Map<string, RawRecord>();
  section.items.forEach((value, index) => {
    const itemPath = `${path}.items[${index}]`;
    const item = requiredRecord(value, itemPath);
    const key = requiredKey(item._key, `${itemPath}._key`);
    if (items.has(key)) {
      throw new Error(`Sanity 항목 키가 중복되었습니다: ${itemPath}._key`);
    }
    items.set(key, item);
  });
  return items;
};

const assertRenderedKeys = (
  metadata: ReadonlyMap<string, unknown>,
  renderedKeys: readonly string[],
  path: string,
) => {
  const expected = new Set(renderedKeys);
  if (expected.size !== renderedKeys.length) {
    throw new Error(`렌더링할 Sanity 항목 키가 중복되었습니다: ${path}`);
  }
  for (const key of expected) {
    if (!metadata.has(key)) {
      throw new Error(`Sanity 분석 메타데이터가 없습니다: ${path}.${key}`);
    }
  }
  for (const key of metadata.keys()) {
    if (!expected.has(key)) {
      throw new Error(
        `Sanity 표시 데이터와 분석 데이터가 다릅니다: ${path}.${key}`,
      );
    }
  }
};

export function readProductAnalyticsMetadata(
  rawProduct: unknown,
  renderedKeys: readonly string[],
): ReadonlyMap<string, TfName> {
  const items = keyedItems(rawProduct, 'mainPage.product');
  assertRenderedKeys(items, renderedKeys, 'mainPage.product.items');

  return new Map(
    [...items].map(([key, item]) => [
      key,
      requiredOption(
        item.analyticsTfName,
        TF_NAMES,
        `mainPage.product.items.${key}.analyticsTfName`,
      ),
    ]),
  );
}

export function readMainContentAnalyticsMetadata(
  rawChannel: unknown,
  renderedKeys: readonly string[],
): ReadonlyMap<string, MainContentAnalytics> {
  const items = keyedItems(rawChannel, 'mainPage.channel');
  assertRenderedKeys(items, renderedKeys, 'mainPage.channel.items');

  return new Map(
    [...items].map(([key, item]) => {
      const category = requiredOption(
        item.analyticsCategory,
        MAIN_CONTENT_CATEGORIES,
        `mainPage.channel.items.${key}.analyticsCategory`,
      );
      const contentType = requiredOption(
        item.analyticsContentType,
        MAIN_CONTENT_TYPES,
        `mainPage.channel.items.${key}.analyticsContentType`,
      );
      return [
        key,
        {
          category: category === 'none' ? '' : category,
          content_type: contentType,
        },
      ];
    }),
  );
}

export function readDepartmentAnalyticsMetadata(
  rawBasicInformation: unknown,
  path: string,
): DepartmentAnalyticsMetadata {
  const basicInformation = requiredRecord(rawBasicInformation, path);
  const slug = requiredRecord(basicInformation.slug, `${path}.slug`).current;
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Sanity URL 슬러그가 올바르지 않습니다: ${path}.slug`);
  }

  const analytics = requiredRecord(
    basicInformation.analytics,
    `${path}.analytics`,
  );
  return {
    jdTeamName: requiredOption(
      analytics.jdTeamName,
      JD_TEAM_NAMES,
      `${path}.analytics.jdTeamName`,
    ),
    recruitingTeamName: requiredOption(
      analytics.recruitingTeamName,
      RECRUITING_TEAM_NAMES,
      `${path}.analytics.recruitingTeamName`,
    ),
    slug,
  };
}

export function readFaqLinkAnalyticsAction(
  rawLink: unknown,
  path: string,
): FaqLinkAnalyticsAction {
  const link = requiredRecord(rawLink, path);
  return requiredOption(
    link.analyticsAction,
    FAQ_LINK_ANALYTICS_ACTIONS,
    `${path}.analyticsAction`,
  );
}
