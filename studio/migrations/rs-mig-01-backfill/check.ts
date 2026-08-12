import {
  planBackfill,
  planCleanup,
  type CleanupManifest,
  type RawDocument,
} from './lib';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const documents: RawDocument[] = [
  {
    _id: 'o',
    _type: 'recruitingSchedule',
    title: '2026년 1학기 리쿠르팅 - 과제 O',
    formSchedule: { start: '2026-03-01', end: '2026-03-10' },
    procedure: [{ _key: 'o-step', step: '서류', schedule: '03.01' }],
  },
  {
    _id: 'x',
    _type: 'recruitingSchedule',
    title: '2026년 1학기 리쿠르팅 - 과제 X',
    isActive: false,
    formSchedule: { start: '2026-03-02', end: '2026-03-11' },
    procedure: [{ _key: 'x-step', step: '서류', schedule: '03.02' }],
  },
  {
    _id: 'with',
    _type: 'department',
    basicInformation: { isRecruiting: true },
    applyProcedure: {
      scheduleWithAssignment: true,
      scheduleWithoutAssignment: false,
      individualSchedule: false,
    },
  },
  {
    _id: 'individual',
    _type: 'department',
    basicInformation: { isRecruiting: true },
    applyProcedure: {
      scheduleWithAssignment: false,
      scheduleWithoutAssignment: false,
      individualSchedule: true,
      formSchedule: { start: '2026-03-04', end: '2026-03-12' },
      procedure: [{ _key: 'individual-step', step: '서류', schedule: '03.04' }],
    },
  },
  {
    _id: 'without',
    _type: 'department',
    basicInformation: { isRecruiting: true },
    applyProcedure: {
      scheduleWithAssignment: false,
      scheduleWithoutAssignment: true,
      individualSchedule: false,
    },
  },
];

const first = planBackfill(documents);
assert(
  first.setActive && first.setTarget,
  'legacy fixture should require one target patch',
);
assert(
  first.target.withoutAssignment.departmentOverrides.length === 1,
  'individual override should be copied',
);

const enriched = documents.map((document) =>
  document._id === 'o'
    ? {
        ...document,
        isActive: true,
        withAssignment: first.target.withAssignment,
        withoutAssignment: first.target.withoutAssignment,
      }
    : document,
);
const second = planBackfill(enriched);
assert(
  !second.setActive && !second.setTarget,
  'identical second run should be a no-op',
);

const expectAbort = (
  fixture: RawDocument[],
  message: string,
  expectedText: string,
  plan: (documents: RawDocument[]) => unknown = planBackfill,
) => {
  try {
    plan(fixture);
    throw new Error(message);
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes(expectedText),
      `${message}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const invalid = documents.map((document) =>
  document._id === 'x'
    ? { ...document, title: '2026년 1학기 리쿠르팅 - 과제 O' }
    : document,
);
expectAbort(
  invalid,
  'duplicate O/X title pair should abort',
  'expected exactly one',
);

const draftFixture = documents.map((document) =>
  document._id === 'o' ? { ...document, _id: 'drafts.o' } : document,
);
expectAbort(
  draftFixture,
  'draft recruitingSchedule should abort before selection',
  'draft document drafts.o',
);

const collisionFixture = [
  ...documents,
  ...['a.b', 'a_b'].map((id) => ({
    _id: id,
    _type: 'department',
    basicInformation: { isRecruiting: true },
    applyProcedure: {
      scheduleWithAssignment: true,
      scheduleWithoutAssignment: false,
      individualSchedule: false,
    },
  })),
];
expectAbort(
  collisionFixture,
  'normalized department IDs should not share generated _key',
  'generated _key collision',
);

const cleanupManifest: CleanupManifest = {
  backfillTargetFingerprint: first.backfillTargetFingerprint,
  departmentIds: first.departmentIds,
  legacyOId: first.legacyOId,
  legacyXId: first.legacyXId,
  removeLegacyRoots: false,
};
const cleanupFirst = planCleanup(enriched, cleanupManifest);
assert(
  cleanupFirst.deleteLegacyX &&
    cleanupFirst.unsetApplyProcedureIds.length === 3 &&
    !cleanupFirst.unsetLegacyRoots,
  'first cleanup should delete X and unset only allowlisted department procedures',
);
const cleanupRerun = planCleanup(
  enriched
    .filter((document) => document._id !== 'x')
    .map((document) => {
      if (document._type !== 'department') return document;
      const { applyProcedure: _applyProcedure, ...withoutProcedure } = document;
      return withoutProcedure;
    }),
  cleanupManifest,
);
assert(
  !cleanupRerun.deleteLegacyX &&
    cleanupRerun.unsetApplyProcedureIds.length === 0 &&
    !cleanupRerun.unsetLegacyRoots,
  'cleanup rerun should validate the fingerprint and be a no-op',
);
expectAbort(
  enriched,
  'cleanup should reject a changed target fingerprint',
  'target fingerprint',
  (fixture) =>
    planCleanup(fixture, {
      ...cleanupManifest,
      backfillTargetFingerprint: 'changed',
    }),
);

process.stdout.write('RS-MIG-01 pure check passed\n');
