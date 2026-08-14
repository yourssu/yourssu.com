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
    title: '2026년 1학기 리크루팅 - 과제 O',
    formSchedule: { start: '2026-03-01', end: '2026-03-10' },
    procedure: [{ _key: 'o-step', step: '서류', schedule: '03.01' }],
  },
  {
    _id: 'x',
    _type: 'recruitingSchedule',
    title: '2026년 1학기 리크루팅 - 과제 X',
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

const omittedLegacyFlags = documents.map((document) => {
  if (document._id !== 'x') return document;
  const { isActive: _isActive, ...withoutActiveFlag } = document;
  return withoutActiveFlag;
});
const omittedFirst = planBackfill(omittedLegacyFlags);
assert(
  omittedFirst.setActive && omittedFirst.setTarget,
  'legacy O/X documents may omit isActive on the initial backfill',
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
    ? { ...document, title: '2026년 1학기 리크루팅 - 과제 O' }
    : document,
);
expectAbort(
  invalid,
  'duplicate O/X title pair should abort',
  'expected exactly one',
);
const activeX = documents.map((document) =>
  document._id === 'x' ? { ...document, isActive: true } : document,
);
expectAbort(
  activeX,
  'selected active X should abort',
  'selected legacy X schedule',
);
const unknownActive = [
  ...documents,
  {
    _id: 'unrelated',
    _type: 'recruitingSchedule',
    title: 'unrelated',
    isActive: undefined,
  },
];
expectAbort(
  unknownActive,
  'unrelated schedule without isActive should abort',
  'unexpected non-inactive schedule',
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
const xPresentPartialCleanup = planCleanup(
  enriched.map((document) => {
    if (document._id !== 'with') return document;
    const { applyProcedure: _applyProcedure, ...withoutProcedure } = document;
    return withoutProcedure;
  }),
  cleanupManifest,
);
assert(
  xPresentPartialCleanup.deleteLegacyX &&
    xPresentPartialCleanup.unsetApplyProcedureIds.length === 2 &&
    xPresentPartialCleanup.unsetApplyProcedureIds.includes('individual') &&
    xPresentPartialCleanup.unsetApplyProcedureIds.includes('without'),
  'cleanup should plan X deletion and only remaining unsets when X remains',
);

const partialCleanup = planCleanup(
  enriched
    .filter((document) => document._id !== 'x')
    .map((document) => {
      if (document._id !== 'with') return document;
      const { applyProcedure: _applyProcedure, ...withoutProcedure } = document;
      return withoutProcedure;
    }),
  cleanupManifest,
);
assert(
  !partialCleanup.deleteLegacyX &&
    partialCleanup.unsetApplyProcedureIds.length === 2 &&
    partialCleanup.unsetApplyProcedureIds.includes('individual') &&
    partialCleanup.unsetApplyProcedureIds.includes('without'),
  'cleanup should plan only remaining department unsets after X was already deleted',
);

const rootsAlreadyRemoved = enriched
  .filter((document) => document._id !== 'x')
  .map((document) => {
    if (document._id !== 'o') return document;
    const {
      formSchedule: _formSchedule,
      procedure: _procedure,
      ...withoutRoots
    } = document;
    return withoutRoots;
  });
const rootsCleanup = planCleanup(rootsAlreadyRemoved, {
  ...cleanupManifest,
  removeLegacyRoots: true,
});
assert(
  !rootsCleanup.unsetLegacyRoots,
  'cleanup should tolerate already-removed optional O legacy roots',
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
