import { at, defineMigration, patch, set } from 'sanity/migrate';

import { planDepartmentSections, type RawDocument } from './lib';

export default defineMigration({
  title: 'RS-MIG-02 backfill ordered department sections',
  documentTypes: ['department'],
  migrate: async function* (documents) {
    for await (const document of documents()) {
      const plan = planDepartmentSections(document as RawDocument);
      if (!plan.shouldPatch) continue;

      yield patch(plan.documentId, [
        at('sections', set(plan.sections)),
        at('contentSchemaVersion', set(2)),
      ]);
    }
  },
});
