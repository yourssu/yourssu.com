import { at, defineMigration, patch, set } from 'sanity/migrate';

import { planBackfill, type RawDocument } from './lib';

export default defineMigration({
  title: 'RS-MIG-01 backfill recruiting schedule targets',
  documentTypes: ['recruitingSchedule', 'department'],
  migrate: async function* (documents) {
    const source: RawDocument[] = [];
    for await (const document of documents())
      source.push(document as RawDocument);

    const plan = planBackfill(source);
    if (!plan.setTarget && !plan.setActive) return;

    const operations = [];
    if (plan.setActive) operations.push(at('isActive', set(true)));
    if (plan.setTarget) {
      operations.push(at('withAssignment', set(plan.target.withAssignment)));
      operations.push(
        at('withoutAssignment', set(plan.target.withoutAssignment)),
      );
    }
    yield patch(plan.targetId, operations);
  },
});
