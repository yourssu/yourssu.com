export interface RecruitingScheduleRange {
  start: Date | string | null;
  end: Date | string | null;
}

export interface RecruitingScheduleProcedureStep {
  step: string | null;
  schedule: string | null;
}

export interface RecruitingDepartmentReference {
  _id: string | null;
  basicInformation: {
    name: string | null;
    isRecruiting: boolean | null;
  } | null;
}

export interface RecruitingScheduleOverride {
  department: RecruitingDepartmentReference | null;
  formSchedule: RecruitingScheduleRange | null;
  procedure: (RecruitingScheduleProcedureStep | null)[] | null;
}

export interface RecruitingScheduleDetail {
  departments: (RecruitingDepartmentReference | null)[] | null;
  formSchedule: RecruitingScheduleRange | null;
  procedure: (RecruitingScheduleProcedureStep | null)[] | null;
  departmentOverrides: (RecruitingScheduleOverride | null)[] | null;
}

export interface RecruitingScheduleDocument {
  _id: string | null;
  title: string | null;
  isActive: boolean | null;
  withAssignment: RecruitingScheduleDetail | null;
  withoutAssignment: RecruitingScheduleDetail | null;
}

export interface ResolvedRecruitingSchedule {
  formSchedule: RecruitingScheduleRange;
  procedure: RecruitingScheduleProcedureStep[];
}

type DetailName = 'withAssignment' | 'withoutAssignment';

interface ValidatedOverride {
  department: RecruitingDepartmentReference & { _id: string };
  formSchedule: RecruitingScheduleRange;
  procedure: RecruitingScheduleProcedureStep[];
}

export interface ValidatedRecruitingScheduleDetail {
  departments: (RecruitingDepartmentReference & { _id: string })[];
  formSchedule: RecruitingScheduleRange;
  procedure: RecruitingScheduleProcedureStep[];
  departmentOverrides: ValidatedOverride[];
}

export interface ValidatedRecruitingSchedule {
  withAssignment: ValidatedRecruitingScheduleDetail;
  withoutAssignment: ValidatedRecruitingScheduleDetail;
}

const documentIdentity = (schedule: RecruitingScheduleDocument) =>
  `${schedule.title || '<untitled>'} (${schedule._id || '<missing-id>'})`;

const departmentIdentity = (
  department: RecruitingDepartmentReference | null | undefined,
) =>
  `${department?.basicInformation?.name || '<unnamed>'} (${department?._id || '<missing-id>'})`;

const fail = (
  schedule: RecruitingScheduleDocument,
  department: RecruitingDepartmentReference | null | undefined,
  message: string,
): never => {
  throw new Error(
    `[recruitingSchedule ${documentIdentity(schedule)}] department ${departmentIdentity(department)}: ${message}`,
  );
};

const requireValue = <T>(
  value: T | null | undefined,
  missing: () => never,
): T => value ?? missing();

const parseScheduleDate = (value: unknown): number | null => {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  if (typeof value !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
    ? date.getTime()
    : null;
};

const requireRange = (
  schedule: RecruitingScheduleDocument,
  department: RecruitingDepartmentReference | null | undefined,
  detailName: DetailName,
  formSchedule: RecruitingScheduleRange | null,
  source = `${detailName}.formSchedule`,
): RecruitingScheduleRange => {
  const requiredRange = requireValue(formSchedule, () =>
    fail(schedule, department, `${source} is missing`),
  );
  const { start, end } = requiredRange;
  const startTime = start === null ? null : parseScheduleDate(start);
  const endTime = end === null ? null : parseScheduleDate(end);
  if (start !== null && startTime === null) {
    fail(schedule, department, `${source}.start is invalid`);
  }
  if (end !== null && endTime === null) {
    fail(schedule, department, `${source}.end is invalid`);
  }
  if (startTime !== null && endTime !== null && startTime > endTime) {
    fail(schedule, department, `${source} starts after it ends`);
  }
  return requiredRange;
};

const requireProcedure = (
  schedule: RecruitingScheduleDocument,
  department: RecruitingDepartmentReference | null | undefined,
  detailName: DetailName,
  procedure: (RecruitingScheduleProcedureStep | null)[] | null,
  source: string,
): RecruitingScheduleProcedureStep[] => {
  const completeProcedure = requireValue(procedure, () =>
    fail(schedule, department, `${detailName}.${source} is missing or empty`),
  );
  if (completeProcedure.length === 0) {
    fail(schedule, department, `${detailName}.${source} is missing or empty`);
  }

  return completeProcedure.map((rawStep, index) => {
    const step = requireValue(rawStep, () =>
      fail(
        schedule,
        department,
        `${detailName}.${source}[${index}] is incomplete`,
      ),
    );
    const stepText = step.step;
    const scheduleText = step.schedule;
    if (
      typeof stepText !== 'string' ||
      !stepText.trim() ||
      typeof scheduleText !== 'string' ||
      !scheduleText.trim()
    ) {
      fail(
        schedule,
        department,
        `${detailName}.${source}[${index}] is incomplete`,
      );
    }
    return { step: stepText, schedule: scheduleText };
  });
};

const requireDepartment = (
  schedule: RecruitingScheduleDocument,
  department: RecruitingDepartmentReference | null | undefined,
  source: string,
  knownDepartmentIds?: ReadonlySet<string>,
): RecruitingDepartmentReference & { _id: string } => {
  const requiredDepartment = requireValue(department, () =>
    fail(schedule, department, `${source} has a missing or broken reference`),
  );
  const id = requiredDepartment._id;
  const requiredId: string =
    typeof id === 'string' && id
      ? id
      : fail(
          schedule,
          department,
          `${source} has a missing or broken reference`,
        );
  if (knownDepartmentIds && !knownDepartmentIds.has(requiredId)) {
    fail(schedule, department, `${source} has a missing or broken reference`);
  }
  return { ...requiredDepartment, _id: requiredId };
};

const validateDetail = (
  schedule: RecruitingScheduleDocument,
  department: RecruitingDepartmentReference | null | undefined,
  detailName: DetailName,
  detail: RecruitingScheduleDetail | null,
  knownDepartmentIds?: ReadonlySet<string>,
): ValidatedRecruitingScheduleDetail => {
  const requiredDetail = requireValue(detail, () =>
    fail(schedule, department, `${detailName} detail is missing`),
  );
  const detailDepartments = requireValue(requiredDetail.departments, () =>
    fail(schedule, department, `${detailName}.departments is missing or empty`),
  );
  if (detailDepartments.length === 0) {
    fail(schedule, department, `${detailName}.departments is missing or empty`);
  }

  const departments = detailDepartments.map((candidate, index) =>
    requireDepartment(
      schedule,
      candidate,
      `${detailName}.departments[${index}]`,
      knownDepartmentIds,
    ),
  );
  const departmentIds = new Set<string>();
  departments.forEach((candidate) => {
    if (departmentIds.has(candidate._id)) {
      fail(
        schedule,
        department,
        `${detailName}.departments contains duplicate reference ${candidate._id}`,
      );
    }
    departmentIds.add(candidate._id);
  });

  const formSchedule = requireRange(
    schedule,
    department,
    detailName,
    requiredDetail.formSchedule,
  );
  const procedure = requireProcedure(
    schedule,
    department,
    detailName,
    requiredDetail.procedure,
    'procedure',
  );
  const overrides = requiredDetail.departmentOverrides || [];
  const overrideIds = new Set<string>();
  const departmentOverrides = overrides.map((rawOverride, index) => {
    const override = requireValue(rawOverride, () =>
      fail(
        schedule,
        department,
        `${detailName}.departmentOverrides[${index}] has a missing or broken reference`,
      ),
    );
    const overrideDepartment = requireDepartment(
      schedule,
      override.department,
      `${detailName}.departmentOverrides[${index}].department`,
      knownDepartmentIds,
    );
    if (overrideIds.has(overrideDepartment._id)) {
      fail(
        schedule,
        department,
        `${detailName}.departmentOverrides contains duplicate reference ${overrideDepartment._id}`,
      );
    }
    overrideIds.add(overrideDepartment._id);

    if (!departmentIds.has(overrideDepartment._id)) {
      fail(
        schedule,
        department,
        `${detailName}.departmentOverrides[${index}] references department ${overrideDepartment._id} outside the detail`,
      );
    }

    return {
      department: overrideDepartment,
      formSchedule: requireRange(
        schedule,
        department,
        detailName,
        override.formSchedule,
        `${detailName}.departmentOverrides[${index}].formSchedule`,
      ),
      procedure: requireProcedure(
        schedule,
        department,
        detailName,
        override.procedure,
        `departmentOverrides[${index}].procedure`,
      ),
    };
  });

  return { departments, formSchedule, procedure, departmentOverrides };
};

export const validateRecruitingSchedule = (
  schedule: RecruitingScheduleDocument,
  knownDepartmentIds?: ReadonlySet<string>,
): ValidatedRecruitingSchedule => {
  if (!schedule._id || !schedule.title?.trim() || schedule.isActive !== true) {
    fail(schedule, null, 'active document identity and title are required');
  }

  const details: [DetailName, RecruitingScheduleDetail | null][] = [
    ['withAssignment', schedule.withAssignment],
    ['withoutAssignment', schedule.withoutAssignment],
  ];
  const validatedDetails = details.map(
    ([detailName, detail]): [DetailName, ValidatedRecruitingScheduleDetail] => [
      detailName,
      validateDetail(schedule, null, detailName, detail, knownDepartmentIds),
    ],
  );
  const mappedDepartmentIds = new Set<string>();
  validatedDetails.forEach(([detailName, detail]) => {
    detail.departments.forEach((department, index) => {
      if (mappedDepartmentIds.has(department._id)) {
        fail(
          schedule,
          null,
          `${detailName}.departments[${index}] maps a department more than once`,
        );
      }
      mappedDepartmentIds.add(department._id);
    });
  });

  return {
    withAssignment: validatedDetails[0][1],
    withoutAssignment: validatedDetails[1][1],
  };
};

export default function recruitingSchedule(
  schedule: RecruitingScheduleDocument,
  department: RecruitingDepartmentReference | null,
): ResolvedRecruitingSchedule {
  const validatedSchedule = validateRecruitingSchedule(schedule);
  const targetDepartment = requireDepartment(
    schedule,
    department,
    'department',
  );
  const validatedDetails: [DetailName, ValidatedRecruitingScheduleDetail][] = [
    ['withAssignment', validatedSchedule.withAssignment],
    ['withoutAssignment', validatedSchedule.withoutAssignment],
  ];

  const matches = validatedDetails.filter(([, candidate]) =>
    candidate.departments.some((item) => item._id === targetDepartment._id),
  );

  if (matches.length !== 1) {
    fail(
      schedule,
      targetDepartment,
      `must map to exactly one recruiting detail; found ${matches.length}`,
    );
  }

  const [, detail] = matches[0];
  const override = detail.departmentOverrides.find(
    (candidate) => candidate.department._id === targetDepartment._id,
  );

  return {
    formSchedule: override?.formSchedule || detail.formSchedule,
    procedure: override?.procedure || detail.procedure,
  };
}
