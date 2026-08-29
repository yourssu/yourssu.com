import { at, defineMigration, patch, set } from 'sanity/migrate';

import { planAnalyticsMetadata, type RawDocument } from './lib';

export default defineMigration({
  title: 'SPR-124 backfill CMS-owned analytics metadata',
  documentTypes: ['department', 'mainPage', 'recruitingPage'],
  migrate: async function* (documents) {
    for await (const document of documents()) {
      const plan = planAnalyticsMetadata(document as RawDocument);
      if (!plan.shouldPatch) continue;

      const operations = [];
      if (plan.setDepartmentAnalytics) {
        operations.push(
          at('basicInformation.analytics', set(plan.setDepartmentAnalytics)),
        );
      }
      if (plan.setDepartmentSlug) {
        operations.push(
          at('basicInformation.slug', set(plan.setDepartmentSlug)),
        );
      }
      if (plan.setProductItems) {
        operations.push(at('product.items', set(plan.setProductItems)));
      }
      if (plan.setChannelItems) {
        operations.push(at('channel.items', set(plan.setChannelItems)));
      }
      if (plan.setFaqItems) {
        operations.push(at('faq.items', set(plan.setFaqItems)));
      }
      yield patch(plan.documentId, operations);
    }
  },
});
