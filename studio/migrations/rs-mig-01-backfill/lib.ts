export type RawDocument = {
  _id?: unknown;
  _type?: unknown;
  [key: string]: unknown;
};

type LegacyMode = 'withAssignment' | 'withoutAssignment' | 'individual';
type TargetDetail = {
  _type: 'recruitingScheduleContent';
  departments: TargetReference[];
  formSchedule: TargetDateContent;
  procedure: TargetProcedureStep[];
  departmentOverrides: TargetDepartmentOverride[];
};

type TargetReference = {
  _key: string;
  _ref: string;
  _type: 'reference';
};
type TargetDateContent = {
  _type: 'dateContent';
  end: string | null;
  start: string | null;
};
type TargetProcedureStep = {
  _key: string;
  _type: 'applyStepContent';
  schedule: string;
  step: string;
};
type TargetDepartmentOverride = {
  _key: string;
  _type: 'object';
  department: TargetReference;
  formSchedule: TargetDateContent;
  procedure: TargetProcedureStep[];
};

export type BackfillPlan = {
  backfillTargetFingerprint: string;
  departmentIds: string[];
  legacyOId: string;
  legacyXId: string;
  target: {
    withAssignment: TargetDetail;
    withoutAssignment: TargetDetail;
  };
  targetId: string;
  setTarget: boolean;
  setActive: boolean;
};

export type CleanupManifest = {
  backfillTargetFingerprint: string;
  departmentIds: string[];
  legacyOId: string;
  legacyXId: string;
  removeLegacyRoots: boolean;
};

export type CleanupPlan = {
  deleteLegacyX: boolean;
  legacyOId: string;
  legacyXId: string;
  unsetApplyProcedureIds: string[];
  unsetLegacyRoots: boolean;
};

const hasOwn = (value: object, key: string) => Object.hasOwn(value, key);

const isRecord = (value: unknown): value is RawDocument =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const idOf = (doc: RawDocument, context: string): string => {
  if (typeof doc._id !== 'string' || !doc._id.trim()) {
    const title = typeof doc.title === 'string' ? ` title="${doc.title}"` : '';
    const departmentName =
      isRecord(doc.basicInformation) &&
      typeof doc.basicInformation.name === 'string'
        ? ` name="${doc.basicInformation.name}"`
        : '';
    throw new Error(
      `${context} has a missing document ID;${title}${departmentName}`,
    );
  }
  return doc._id;
};

const displayId = (doc: RawDocument) =>
  typeof doc._id === 'string' && doc._id.trim() ? doc._id : '<missing-id>';

const titleOf = (doc: RawDocument) =>
  typeof doc.title === 'string' && doc.title.trim()
    ? doc.title
    : '<missing-title>';

const nameOf = (doc: RawDocument) => {
  const basicInformation = isRecord(doc.basicInformation)
    ? doc.basicInformation
    : null;
  return typeof basicInformation?.name === 'string' &&
    basicInformation.name.trim()
    ? basicInformation.name
    : '<unnamed>';
};

const inventory = (documents: RawDocument[]) => {
  const schedules = documents.filter(
    (doc) => doc._type === 'recruitingSchedule',
  );
  const departments = documents.filter((doc) => doc._type === 'department');
  const scheduleReport = schedules.length
    ? schedules
        .map(
          (doc) =>
            `${displayId(doc)} "${titleOf(doc)}" isActive=${String(doc.isActive)}`,
        )
        .join(', ')
    : '<none>';
  const departmentReport = departments.length
    ? departments.map((doc) => `${displayId(doc)} "${nameOf(doc)}"`).join(', ')
    : '<none>';
  return `Relevant recruitingSchedule IDs/titles: ${scheduleReport}\nRelevant department IDs/names: ${departmentReport}`;
};

const abort = (documents: RawDocument[], message: string): never => {
  throw new Error(
    `RS-MIG-01 preflight aborted: ${message}\n${inventory(documents)}`,
  );
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const sameValue = (left: unknown, right: unknown) =>
  stableStringify(left) === stableStringify(right);

const targetFingerprint = (
  id: string,
  title: string,
  target: {
    withAssignment: TargetDetail;
    withoutAssignment: TargetDetail;
  },
) =>
  stableStringify({
    _id: id,
    title,
    withAssignment: target.withAssignment,
    withoutAssignment: target.withoutAssignment,
  });

const targetFingerprintOfDocument = (
  documents: RawDocument[],
  schedule: RawDocument,
) => {
  const id = idOf(schedule, 'recruitingSchedule');
  if (typeof schedule.title !== 'string' || !schedule.title.trim()) {
    abort(documents, `recruitingSchedule ${id} is missing a title`);
  }
  if (
    !isRecord(schedule.withAssignment) ||
    !isRecord(schedule.withoutAssignment)
  ) {
    abort(
      documents,
      `recruitingSchedule ${id} is missing a complete target payload`,
    );
  }
  return targetFingerprint(id, schedule.title as string, {
    withAssignment: schedule.withAssignment as TargetDetail,
    withoutAssignment: schedule.withoutAssignment as TargetDetail,
  });
};

const assertNoDraftDocuments = (documents: RawDocument[]) => {
  const draft = documents.find(
    (document) =>
      (document._type === 'recruitingSchedule' ||
        document._type === 'department') &&
      typeof document._id === 'string' &&
      document._id.startsWith('drafts.'),
  );
  if (draft) {
    abort(
      documents,
      `draft document ${draft._id as string} is present; published documents only are required`,
    );
  }
};

const titleParts = (
  title: unknown,
): { mode: 'O' | 'X'; prefix: string } | null => {
  if (typeof title !== 'string') return null;
  const match = /^(.*?)\s*-\s*과제 ([OX])$/.exec(title.trim());
  if (!match || !match[1].trim()) return null;
  return { mode: match[2] as 'O' | 'X', prefix: match[1].trim() };
};

const collectById = (
  documents: RawDocument[],
  type: 'department' | 'recruitingSchedule',
): RawDocument[] => {
  const matching = documents.filter((doc) => doc._type === type);
  const ids = new Set<string>();
  matching.forEach((doc) => {
    const id = idOf(doc, type);
    if (ids.has(id)) abort(documents, `duplicate ${type} ID ${id}`);
    ids.add(id);
  });
  return matching;
};

const assertBoolean = (
  documents: RawDocument[],
  value: unknown,
  path: string,
): boolean => {
  if (typeof value !== 'boolean') abort(documents, `${path} must be boolean`);
  return value as boolean;
};

const parseDate = (
  documents: RawDocument[],
  value: unknown,
  path: string,
): string | null => {
  if (value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    abort(documents, `${path} is malformed; expected YYYY-MM-DD or null`);
  }
  const dateValue = value as string;
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    abort(documents, `${path} is malformed; expected a real calendar date`);
  }
  return dateValue;
};

const targetKey = (prefix: string, id: string) =>
  `${prefix}-${id}`.replace(/[^A-Za-z0-9_-]/g, '_');

const targetReference = (id: string, prefix: string): TargetReference => ({
  _key: targetKey(prefix, id),
  _ref: id,
  _type: 'reference',
});

const targetDate = (
  documents: RawDocument[],
  value: unknown,
  path: string,
): TargetDateContent => {
  if (!isRecord(value)) abort(documents, `${path} is missing or malformed`);
  const dateValue = value as RawDocument;
  return {
    _type: 'dateContent',
    end: parseDate(documents, dateValue.end, `${path}.end`),
    start: parseDate(documents, dateValue.start, `${path}.start`),
  };
};

const targetProcedure = (
  documents: RawDocument[],
  value: unknown,
  path: string,
): TargetProcedureStep[] => {
  if (!Array.isArray(value) || value.length === 0) {
    abort(documents, `${path} is missing or empty`);
  }
  const candidates = value as unknown[];
  const keys = new Set<string>();
  return candidates.map((candidate, index) => {
    if (!isRecord(candidate))
      abort(documents, `${path}[${index}] is incomplete`);
    const stepValue = candidate as RawDocument;
    if (
      typeof stepValue.step !== 'string' ||
      !stepValue.step.trim() ||
      typeof stepValue.schedule !== 'string' ||
      !stepValue.schedule.trim()
    ) {
      abort(documents, `${path}[${index}] is incomplete`);
    }
    const key =
      typeof stepValue._key === 'string' && stepValue._key.trim()
        ? stepValue._key
        : targetKey(`procedure-${index}`, path);
    if (keys.has(key))
      abort(documents, `${path} contains duplicate _key ${key}`);
    keys.add(key);
    return {
      _key: key,
      _type: 'applyStepContent',
      schedule: stepValue.schedule as string,
      step: stepValue.step as string,
    };
  });
};

const completeLegacySchedule = (
  documents: RawDocument[],
  schedule: RawDocument,
  label: string,
) => {
  const id = idOf(schedule, 'recruitingSchedule');
  return {
    formSchedule: targetDate(
      documents,
      schedule.formSchedule,
      `${label} ${id}.formSchedule`,
    ),
    procedure: targetProcedure(
      documents,
      schedule.procedure,
      `${label} ${id}.procedure`,
    ),
  };
};

const legacyMode = (
  documents: RawDocument[],
  department: RawDocument,
): LegacyMode | null => {
  const id = idOf(department, 'department');
  const recruiting = isRecord(department.basicInformation)
    ? department.basicInformation.isRecruiting
    : undefined;
  if (typeof recruiting !== 'boolean') {
    abort(
      documents,
      `department ${id} is missing basicInformation.isRecruiting`,
    );
  }

  const applyProcedure = department.applyProcedure;
  if (applyProcedure === undefined || applyProcedure === null) {
    if (recruiting)
      abort(documents, `recruiting department ${id} is missing applyProcedure`);
    return null;
  }
  if (!isRecord(applyProcedure)) {
    abort(documents, `department ${id}.applyProcedure is malformed`);
  }
  const legacy = applyProcedure as RawDocument;

  const flags = {
    individual: assertBoolean(
      documents,
      legacy.individualSchedule,
      `department ${id}.applyProcedure.individualSchedule`,
    ),
    withAssignment: assertBoolean(
      documents,
      legacy.scheduleWithAssignment,
      `department ${id}.applyProcedure.scheduleWithAssignment`,
    ),
    withoutAssignment: assertBoolean(
      documents,
      legacy.scheduleWithoutAssignment,
      `department ${id}.applyProcedure.scheduleWithoutAssignment`,
    ),
  };
  const enabled = Object.entries(flags)
    .filter(([, value]) => value)
    .map(([key]) => key as LegacyMode);
  if (!recruiting) {
    if (enabled.length > 0) {
      abort(
        documents,
        `non-recruiting department ${id} has a legacy recruiting mode`,
      );
    }
    return null;
  }
  if (enabled.length !== 1) {
    abort(
      documents,
      `recruiting department ${id} must have exactly one legacy mode; found ${enabled.join(', ') || 'none'}`,
    );
  }
  return enabled[0];
};

const departmentGroups = (
  documents: RawDocument[],
  departments: RawDocument[],
) => {
  const withAssignment: RawDocument[] = [];
  const withoutAssignment: RawDocument[] = [];
  const individual: RawDocument[] = [];
  departments.forEach((department) => {
    const mode = legacyMode(documents, department);
    if (mode === 'withAssignment') withAssignment.push(department);
    if (mode === 'withoutAssignment') withoutAssignment.push(department);
    if (mode === 'individual') individual.push(department);
  });
  return {
    individual: individual.sort((left, right) =>
      idOf(left, 'department').localeCompare(idOf(right, 'department')),
    ),
    withAssignment: withAssignment.sort((left, right) =>
      idOf(left, 'department').localeCompare(idOf(right, 'department')),
    ),
    withoutAssignment: withoutAssignment.sort((left, right) =>
      idOf(left, 'department').localeCompare(idOf(right, 'department')),
    ),
  };
};

const departmentReference = (department: RawDocument, prefix: string) =>
  targetReference(idOf(department, 'department'), prefix);

const buildDetail = (
  documents: RawDocument[],
  source: { formSchedule: TargetDateContent; procedure: TargetProcedureStep[] },
  departments: RawDocument[],
  overrides: RawDocument[],
): TargetDetail => {
  if (departments.length === 0) {
    abort(
      documents,
      'target detail must contain at least one recruiting department',
    );
  }
  const departmentIds = new Set<string>();
  const referenceKeys = new Set<string>();
  const refs = departments.map((department) => {
    const id = idOf(department, 'department');
    if (departmentIds.has(id))
      abort(documents, `duplicate target department ID ${id}`);
    departmentIds.add(id);
    const reference = departmentReference(department, 'department');
    if (referenceKeys.has(reference._key)) {
      abort(
        documents,
        `generated _key collision for department IDs in target detail: ${id}`,
      );
    }
    referenceKeys.add(reference._key);
    return reference;
  });
  const overrideKeys = new Set<string>();
  const departmentOverrides = overrides.map((department) => {
    const id = idOf(department, 'department');
    const key = targetKey('override', id);
    if (overrideKeys.has(key))
      abort(documents, `duplicate department override key ${key}`);
    overrideKeys.add(key);
    const applyProcedure = department.applyProcedure;
    if (!isRecord(applyProcedure)) {
      abort(
        documents,
        `department ${id}.applyProcedure is missing for individual schedule`,
      );
    }
    const legacy = applyProcedure as RawDocument;
    return {
      _key: key,
      _type: 'object' as const,
      department: departmentReference(department, 'override-department'),
      formSchedule: targetDate(
        documents,
        legacy.formSchedule,
        `department ${id}.applyProcedure.formSchedule`,
      ),
      procedure: targetProcedure(
        documents,
        legacy.procedure,
        `department ${id}.applyProcedure.procedure`,
      ),
    };
  });
  return {
    _type: 'recruitingScheduleContent',
    departments: refs,
    departmentOverrides,
    formSchedule: source.formSchedule,
    procedure: source.procedure,
  };
};

const assertScheduleStates = (
  documents: RawDocument[],
  selectedOId: string,
  selectedXId: string,
) => {
  documents
    .filter((doc) => doc._type === 'recruitingSchedule')
    .forEach((doc) => {
      const id = idOf(doc, 'recruitingSchedule');
      if (doc.isActive !== undefined && typeof doc.isActive !== 'boolean') {
        abort(documents, `recruitingSchedule ${id} has malformed isActive`);
      }
      if (
        id === selectedXId &&
        doc.isActive !== undefined &&
        doc.isActive !== false
      ) {
        abort(
          documents,
          `selected legacy X schedule ${id} must be inactive or omit isActive`,
        );
      }
      if (id !== selectedOId && id !== selectedXId && doc.isActive !== false) {
        abort(
          documents,
          `unexpected non-inactive schedule ${id} "${titleOf(doc)}" isActive=${String(doc.isActive)}`,
        );
      }
      if (
        id !== selectedOId &&
        (hasOwn(doc, 'withAssignment') || hasOwn(doc, 'withoutAssignment'))
      ) {
        abort(
          documents,
          `unexpected target fields on schedule ${id} "${titleOf(doc)}"`,
        );
      }
    });
};

const pair = (documents: RawDocument[]) => {
  const schedules = collectById(documents, 'recruitingSchedule');
  const candidates = schedules.flatMap((schedule) => {
    const parts = titleParts(schedule.title);
    return parts ? [{ schedule, parts }] : [];
  });
  const oCandidates = candidates.filter(({ parts }) => parts.mode === 'O');
  const xCandidates = candidates.filter(({ parts }) => parts.mode === 'X');
  if (oCandidates.length !== 1 || xCandidates.length !== 1) {
    abort(
      documents,
      `expected exactly one legacy title ending "과제 O" and one ending "과제 X"; found O=${oCandidates.length}, X=${xCandidates.length}`,
    );
  }
  if (oCandidates[0].parts.prefix !== xCandidates[0].parts.prefix) {
    abort(
      documents,
      `legacy title pair has different cycle prefixes: "${titleOf(oCandidates[0].schedule)}" and "${titleOf(xCandidates[0].schedule)}"`,
    );
  }
  return { o: oCandidates[0].schedule, x: xCandidates[0].schedule };
};

export const planBackfill = (documents: RawDocument[]): BackfillPlan => {
  assertNoDraftDocuments(documents);
  const { o, x } = pair(documents);
  const legacyOId = idOf(o, 'recruitingSchedule');
  const legacyXId = idOf(x, 'recruitingSchedule');
  assertScheduleStates(documents, legacyOId, legacyXId);

  const departments = collectById(documents, 'department');
  const groups = departmentGroups(documents, departments);
  const withSchedule = completeLegacySchedule(
    documents,
    o,
    'legacy O schedule',
  );
  const withoutSchedule = completeLegacySchedule(
    documents,
    x,
    'legacy X schedule',
  );
  const withoutAssignmentDepartments = [
    ...groups.withoutAssignment,
    ...groups.individual,
  ].sort((left, right) =>
    idOf(left, 'department').localeCompare(idOf(right, 'department')),
  );
  const target = {
    withAssignment: buildDetail(
      documents,
      withSchedule,
      groups.withAssignment,
      [],
    ),
    withoutAssignment: buildDetail(
      documents,
      withoutSchedule,
      withoutAssignmentDepartments,
      groups.individual,
    ),
  };
  const departmentIds = [
    ...groups.withAssignment,
    ...groups.withoutAssignment,
    ...groups.individual,
  ]
    .map((department) => idOf(department, 'department'))
    .sort();

  const hasWith = hasOwn(o, 'withAssignment');
  const hasWithout = hasOwn(o, 'withoutAssignment');
  if (hasWith !== hasWithout) {
    abort(
      documents,
      `selected O schedule ${legacyOId} has only one new target field`,
    );
  }
  const hasTarget = hasWith && hasWithout;
  if (hasTarget && o.isActive !== true) {
    abort(
      documents,
      `selected O schedule ${legacyOId} has target fields but is not active`,
    );
  }
  if (
    hasTarget &&
    (!sameValue(o.withAssignment, target.withAssignment) ||
      !sameValue(o.withoutAssignment, target.withoutAssignment))
  ) {
    abort(
      documents,
      `selected O schedule ${legacyOId} has a non-identical existing target payload`,
    );
  }
  if (o.isActive === true && !hasTarget) {
    abort(
      documents,
      `selected O schedule ${legacyOId} is active but lacks both target payloads`,
    );
  }

  return {
    backfillTargetFingerprint: targetFingerprint(
      legacyOId,
      o.title as string,
      target,
    ),
    departmentIds,
    legacyOId,
    legacyXId,
    setActive: o.isActive !== true,
    setTarget: !hasTarget,
    target,
    targetId: legacyOId,
  };
};

const hasLegacyRoots = (schedule: RawDocument) =>
  hasOwn(schedule, 'formSchedule') || hasOwn(schedule, 'procedure');

const targetDepartmentIds = (
  documents: RawDocument[],
  schedule: RawDocument,
): string[] => {
  const ids = new Set<string>();
  for (const detailName of ['withAssignment', 'withoutAssignment'] as const) {
    const detail = schedule[detailName];
    const detailRecord: RawDocument = isRecord(detail)
      ? detail
      : abort(
          documents,
          `selected O schedule ${idOf(schedule, 'recruitingSchedule')} has malformed ${detailName} target departments`,
        );
    const references: unknown[] = Array.isArray(detailRecord.departments)
      ? detailRecord.departments
      : abort(
          documents,
          `selected O schedule ${idOf(schedule, 'recruitingSchedule')} has malformed ${detailName} target departments`,
        );
    for (const [index, reference] of references.entries()) {
      const referenceId =
        isRecord(reference) &&
        typeof reference._ref === 'string' &&
        reference._ref.trim()
          ? reference._ref
          : abort(
              documents,
              `selected O schedule ${idOf(schedule, 'recruitingSchedule')} has malformed ${detailName}.departments[${index}] target reference`,
            );
      if (ids.has(referenceId)) {
        abort(
          documents,
          `selected O schedule ${idOf(schedule, 'recruitingSchedule')} maps department ${referenceId} more than once`,
        );
      }
      ids.add(referenceId);
    }
  }
  return [...ids].sort();
};

const assertCleanupDepartmentAllowlist = (
  documents: RawDocument[],
  departments: RawDocument[],
  o: RawDocument,
  manifest: CleanupManifest,
) => {
  const targetIds = targetDepartmentIds(documents, o);
  const manifestIds = [...manifest.departmentIds].sort();
  if (!sameValue(manifestIds, targetIds)) {
    abort(
      documents,
      `cleanup manifest department allowlist does not exactly match O target IDs: expected ${targetIds.join(', ') || '<none>'}, received ${manifestIds.join(', ') || '<none>'}`,
    );
  }
  const departmentIds = new Set(
    departments.map((department) => idOf(department, 'department')),
  );
  manifest.departmentIds.forEach((id) => {
    if (!departmentIds.has(id))
      abort(documents, `cleanup department ID ${id} was not found`);
  });
};

const assertAlreadyBackfilledO = (documents: RawDocument[], o: RawDocument) => {
  const id = idOf(o, 'recruitingSchedule');
  if (
    o.isActive !== true ||
    !hasOwn(o, 'withAssignment') ||
    !hasOwn(o, 'withoutAssignment')
  ) {
    abort(
      documents,
      `selected O schedule ${id} is not an active enriched target`,
    );
  }
  if (!isRecord(o.withAssignment) || !isRecord(o.withoutAssignment)) {
    abort(documents, `selected O schedule ${id} has malformed target fields`);
  }
};

const assertPostBackfillScheduleStates = (
  documents: RawDocument[],
  selectedOId: string,
) => {
  documents
    .filter((doc) => doc._type === 'recruitingSchedule')
    .forEach((doc) => {
      const id = idOf(doc, 'recruitingSchedule');
      if (id !== selectedOId && doc.isActive !== false) {
        abort(
          documents,
          `unexpected non-inactive schedule ${id} "${titleOf(doc)}" isActive=${String(doc.isActive)}`,
        );
      }
      if (
        id !== selectedOId &&
        (hasOwn(doc, 'withAssignment') || hasOwn(doc, 'withoutAssignment'))
      ) {
        abort(
          documents,
          `unexpected target fields on schedule ${id} "${titleOf(doc)}"`,
        );
      }
    });
};

export const planCleanup = (
  documents: RawDocument[],
  manifest: CleanupManifest,
): CleanupPlan => {
  assertNoDraftDocuments(documents);
  if (
    typeof manifest.backfillTargetFingerprint !== 'string' ||
    !manifest.backfillTargetFingerprint ||
    typeof manifest.legacyOId !== 'string' ||
    typeof manifest.legacyXId !== 'string' ||
    !Array.isArray(manifest.departmentIds) ||
    manifest.departmentIds.length === 0 ||
    manifest.departmentIds.some((id) => typeof id !== 'string' || !id) ||
    new Set(manifest.departmentIds).size !== manifest.departmentIds.length ||
    typeof manifest.removeLegacyRoots !== 'boolean'
  ) {
    abort(
      documents,
      'cleanup requires non-empty, unique exact O ID, X ID, and department allowlist',
    );
  }

  const schedules = collectById(documents, 'recruitingSchedule');
  const departments = collectById(documents, 'department');
  const o = schedules.find((schedule) => schedule._id === manifest.legacyOId);
  const x = schedules.find((schedule) => schedule._id === manifest.legacyXId);
  if (!o) abort(documents, `cleanup O ID ${manifest.legacyOId} was not found`);
  const selectedO = o as RawDocument;

  const xStillExists = Boolean(x);
  if (xStillExists) {
    const paired = pair(documents);
    const selectedX = paired.x;
    const selectedOId = idOf(paired.o, 'recruitingSchedule');
    const selectedXId = idOf(selectedX, 'recruitingSchedule');
    if (
      selectedOId !== manifest.legacyOId ||
      selectedXId !== manifest.legacyXId
    ) {
      abort(
        documents,
        `cleanup manifest schedule IDs do not match validated pair: O=${manifest.legacyOId}, X=${manifest.legacyXId}`,
      );
    }
    assertScheduleStates(documents, selectedOId, selectedXId);
    assertAlreadyBackfilledO(documents, paired.o);
    if (
      targetFingerprintOfDocument(documents, paired.o) !==
      manifest.backfillTargetFingerprint
    ) {
      abort(
        documents,
        `cleanup manifest target fingerprint does not match O document ${manifest.legacyOId}`,
      );
    }
    assertCleanupDepartmentAllowlist(
      documents,
      departments,
      paired.o,
      manifest,
    );
  } else {
    const otherLegacyX = schedules.filter(
      (schedule) => titleParts(schedule.title)?.mode === 'X',
    );
    if (otherLegacyX.length > 0) {
      abort(
        documents,
        'validated legacy X ID is absent but another legacy X schedule exists',
      );
    }
    assertAlreadyBackfilledO(documents, selectedO);
    if (
      targetFingerprintOfDocument(documents, selectedO) !==
      manifest.backfillTargetFingerprint
    ) {
      abort(
        documents,
        `cleanup manifest target fingerprint does not match O document ${manifest.legacyOId}`,
      );
    }
    const selectedTitle = titleParts(selectedO.title);
    if (!selectedTitle || selectedTitle.mode !== 'O') {
      abort(
        documents,
        `cleanup O document ${manifest.legacyOId} does not retain a legacy O title`,
      );
    }
    assertPostBackfillScheduleStates(documents, manifest.legacyOId);
    assertCleanupDepartmentAllowlist(
      documents,
      departments,
      selectedO,
      manifest,
    );
  }

  const unsetApplyProcedureIds = departments
    .filter(
      (department) =>
        typeof department._id === 'string' &&
        manifest.departmentIds.includes(department._id) &&
        hasOwn(department, 'applyProcedure'),
    )
    .map((department) => department._id as string)
    .sort();

  return {
    deleteLegacyX: xStillExists,
    legacyOId: manifest.legacyOId,
    legacyXId: manifest.legacyXId,
    unsetApplyProcedureIds,
    unsetLegacyRoots: manifest.removeLegacyRoots && hasLegacyRoots(selectedO),
  };
};
