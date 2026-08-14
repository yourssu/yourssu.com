import recruitingSchedule, {
  type RecruitingDepartmentReference,
  type RecruitingScheduleDocument,
  validateRecruitingSchedule,
} from '../src/utils/recruitingSchedule';

const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) throw new Error(message);
};

const assertThrows = (run: () => unknown, expectedMessage: string) => {
  try {
    run();
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes(expectedMessage),
      `expected error containing: ${expectedMessage}`,
    );
    return;
  }
  throw new Error(`expected error containing: ${expectedMessage}`);
};

const department = (id: string, name = id): RecruitingDepartmentReference => ({
  _id: id,
  basicInformation: { name, isRecruiting: true },
});

const knownDepartmentIds = new Set(['design', 'engineering']);

const schedule: RecruitingScheduleDocument = {
  _id: 'schedule-1',
  title: '2026년 1학기 리크루팅',
  isActive: true,
  withAssignment: {
    departments: [department('design')],
    formSchedule: { start: null, end: null },
    procedure: [{ step: '서류', schedule: '03.01' }],
    departmentOverrides: [],
  },
  withoutAssignment: {
    departments: [department('engineering')],
    formSchedule: { start: new Date('2026-03-01'), end: null },
    procedure: [{ step: '서류', schedule: '03.02' }],
    departmentOverrides: [],
  },
};

const detailFor = (
  value: RecruitingScheduleDocument,
  detailName: 'withAssignment' | 'withoutAssignment',
) => {
  const detail = value[detailName];
  assert(detail, `${detailName} detail should exist in the focused fixture`);
  return detail;
};

const resolved = recruitingSchedule(
  schedule,
  department('design'),
  knownDepartmentIds,
);
assertThrows(
  () => recruitingSchedule(schedule, department('unknown'), knownDepartmentIds),
  'missing or broken reference',
);
assert(
  resolved.formSchedule.start === null && resolved.formSchedule.end === null,
  'base schedule should preserve open-ended dates',
);
assert(
  resolved.procedure[0]?.step === '서류' &&
    resolved.procedure[0].schedule === '03.01',
  'base procedure should resolve',
);

const noRecruitingSchedule: RecruitingScheduleDocument =
  structuredClone(schedule);
for (const detailName of ['withAssignment', 'withoutAssignment'] as const) {
  const detail = detailFor(noRecruitingSchedule, detailName);
  assert(detail.departments, `${detailName} departments should exist`);
  detail.departments.forEach((value) => {
    assert(value, `${detailName} department should exist`);
    if (value.basicInformation) value.basicInformation.isRecruiting = false;
  });
}
detailFor(noRecruitingSchedule, 'withAssignment').procedure = [
  { step: '서류', schedule: null },
];
assertThrows(
  () => validateRecruitingSchedule(noRecruitingSchedule, knownDepartmentIds),
  'incomplete',
);

const validStringSchedule = structuredClone(schedule);
detailFor(validStringSchedule, 'withAssignment').formSchedule = {
  start: '2026-03-01',
  end: '2026-03-02',
};
assert(
  recruitingSchedule(
    validStringSchedule,
    department('design'),
    knownDepartmentIds,
  ).formSchedule.start === '2026-03-01',
  'valid exact date strings should remain valid',
);

const overrideSchedule: RecruitingScheduleDocument = {
  ...schedule,
  withAssignment: {
    ...detailFor(schedule, 'withAssignment'),
    departmentOverrides: [
      {
        department: department('design'),
        formSchedule: {
          start: new Date('2026-03-03'),
          end: new Date('2026-03-04'),
        },
        procedure: [{ step: '면접', schedule: '03.05' }],
      },
    ],
  },
};
const override = recruitingSchedule(
  overrideSchedule,
  department('design'),
  knownDepartmentIds,
);
assert(
  override.formSchedule.start instanceof Date &&
    override.formSchedule.start.toISOString() === '2026-03-03T00:00:00.000Z' &&
    override.procedure[0]?.step === '면접',
  'complete override should replace base schedule and procedure',
);

const rejects = (
  mutate: (value: RecruitingScheduleDocument) => void,
  message: string,
) => {
  const invalid = structuredClone(schedule);
  mutate(invalid);
  assertThrows(
    () => recruitingSchedule(invalid, department('design'), knownDepartmentIds),
    message,
  );
};

const rejectsBeforeDepartmentResolution = (
  mutate: (value: RecruitingScheduleDocument) => void,
  message: string,
) => {
  const invalid = structuredClone(schedule);
  mutate(invalid);
  assertThrows(
    () =>
      validateRecruitingSchedule(invalid, new Set(['design', 'engineering'])),
    message,
  );
};

rejects((value) => {
  detailFor(value, 'withAssignment').departments = [
    department('design'),
    department('design'),
  ];
}, 'duplicate reference');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withAssignment').departmentOverrides = [
    {
      department: department('unknown'),
      formSchedule: { start: null, end: null },
      procedure: [{ step: '서류', schedule: '03.01' }],
    },
  ];
}, 'missing or broken reference');
rejects((value) => {
  detailFor(value, 'withAssignment').departmentOverrides = [
    {
      department: department('engineering'),
      formSchedule: { start: null, end: null },
      procedure: [{ step: '서류', schedule: '03.01' }],
    },
  ];
}, 'outside the detail');
rejects((value) => {
  detailFor(value, 'withAssignment').departmentOverrides = [
    {
      department: department('design'),
      formSchedule: { start: null, end: null },
      procedure: [{ step: '서류', schedule: '03.01' }],
    },
    {
      department: department('design'),
      formSchedule: { start: null, end: null },
      procedure: [{ step: '서류', schedule: '03.01' }],
    },
  ];
}, 'duplicate reference');
rejects((value) => {
  detailFor(value, 'withoutAssignment').departments = [department('design')];
}, 'maps a department more than once');
rejects((value) => {
  detailFor(value, 'withAssignment').procedure = [
    { step: '서류', schedule: null },
  ];
}, 'incomplete');
rejects((value) => {
  detailFor(value, 'withoutAssignment').formSchedule = {
    start: new Date('2026-03-10'),
    end: new Date('2026-03-01'),
  };
}, 'starts after it ends');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withAssignment').procedure = null;
}, 'missing or empty');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withoutAssignment').formSchedule = {
    start: new Date('2026-03-10'),
    end: new Date('2026-03-01'),
  };
}, 'starts after it ends');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withAssignment').formSchedule = {
    start: new Date('not-a-date'),
    end: null,
  };
}, 'formSchedule.start is invalid');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withoutAssignment').formSchedule = {
    start: null,
    end: new Date('not-a-date'),
  };
}, 'formSchedule.end is invalid');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withAssignment').formSchedule = {
    start: '2026-02-30',
    end: null,
  };
}, 'formSchedule.start is invalid');
rejectsBeforeDepartmentResolution((value) => {
  detailFor(value, 'withAssignment').formSchedule = {
    start: '0',
    end: null,
  };
}, 'formSchedule.start is invalid');
rejectsBeforeDepartmentResolution((value) => {
  Object.assign(detailFor(value, 'withAssignment'), {
    formSchedule: { start: 0, end: null },
  });
}, 'formSchedule.start is invalid');
