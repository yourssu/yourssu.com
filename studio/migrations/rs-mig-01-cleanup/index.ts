import { at, defineMigration, del, patch, unset } from 'sanity/migrate';

import {
  planCleanup,
  type CleanupManifest,
  type RawDocument,
} from '../rs-mig-01-backfill/lib';

const manifest: CleanupManifest = {
  // Fill these values from the successful backfill report. Do not broaden the list.
  // Keep this operator-local and uncommitted: it binds cleanup to one enriched O payload.
  backfillTargetFingerprint: '',
  departmentIds: [],
  legacyOId: '',
  legacyXId: '',
  removeLegacyRoots: false,
};

export default defineMigration({
  title: 'RS-MIG-01 cleanup validated legacy schedule data',
  documentTypes: ['recruitingSchedule', 'department'],
  migrate: async function* (documents) {
    const source: RawDocument[] = [];
    for await (const document of documents())
      source.push(document as RawDocument);

    const plan = planCleanup(source, manifest);
    if (
      !plan.deleteLegacyX &&
      plan.unsetApplyProcedureIds.length === 0 &&
      !plan.unsetLegacyRoots
    ) {
      return;
    }

    if (plan.deleteLegacyX) yield del(plan.legacyXId);
    for (const departmentId of plan.unsetApplyProcedureIds) {
      yield patch(departmentId, at('applyProcedure', unset()));
    }
    if (plan.unsetLegacyRoots) {
      yield patch(plan.legacyOId, [
        at('formSchedule', unset()),
        at('procedure', unset()),
      ]);
    }
  },
});
