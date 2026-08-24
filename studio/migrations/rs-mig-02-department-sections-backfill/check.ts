import {
  buildDepartmentSections,
  planDepartmentSections,
  type RawDocument,
  type TargetDepartmentSection,
} from './lib';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const expectAbort = (document: RawDocument, expectedText: string) => {
  let caught: unknown;
  try {
    planDepartmentSections(document);
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof Error && caught.message.includes(expectedText),
    caught instanceof Error
      ? caught.message
      : `Expected migration to abort with "${expectedText}".`,
  );
};

const fixture: RawDocument = {
  _id: 'department.fixture',
  _type: 'department',
  task: {
    _type: 'defaultContent',
    title: '부서 업무',
    content: ['[팀 비전]', '일반 **강조**\\n다음 줄'],
  },
  growthAndDiff: {
    _type: 'growthAndDiffContent',
    title: '성장 및 차별점',
  },
  ideal: {
    _type: 'defaultContent',
    title: '인재상',
    content: ['인재상 항목'],
  },
  experience: {
    _type: 'defaultContent',
    title: '추천 경험',
    content: ['추천 경험 항목'],
  },
  skill: {
    _type: 'skillContent',
    title: '기술 스택',
    content: ['TypeScript'],
    notice: [],
  },
  inaWord: {
    _type: 'inaWordContent',
    title: '한 마디',
    word: '함께 성장해요.',
  },
  FAQ: {
    _type: 'FAQContent',
    title: 'FAQ',
    FAQList: [
      {
        _key: 'faq-1',
        _type: 'FAQItem',
        question: '질문',
        answer: '답변',
      },
    ],
  },
  roadToProVideo: {
    _type: 'roadToProContent',
    title: 'Road to Pro',
    roadToPro_list: [
      { _key: 'video-1', _ref: 'road-to-pro-1', _type: 'reference' },
    ],
  },
  medium: {
    _type: 'articleContent',
    article: [
      {
        _key: 'article-1',
        _type: 'article',
        title: '글 제목',
        url: 'https://example.com',
      },
    ],
  },
};

const snapshot = JSON.stringify(fixture);
const sections = buildDepartmentSections(fixture);
assert(
  JSON.stringify(fixture) === snapshot,
  'conversion must not mutate legacy data',
);
assert(
  sections.map(({ kind }) => kind).join(',') ===
    'richText,richText,richText,richText,applyProcedure,quote,faq,roadToPro,articles',
  'sections must preserve the legacy rendering order and skip empty content',
);

const task = sections[0];
assert(task.body?.[0].style === 'h3', 'sentinel must become an h3 block');
assert(
  task.body?.[1].listItem === 'bullet',
  'ordinary content must become a bullet block',
);
assert(
  task.body?.[1].children.some(
    ({ marks, text }) => marks.includes('strong') && text === '강조',
  ),
  'legacy bold markers must become strong spans',
);
assert(
  task.body?.[1].children.some(({ text }) => text.includes('\n')),
  'legacy escaped newlines must become real newlines',
);
assert(
  sections[2].description ===
    '아래 내용에 모두 해당하지 않아도 충분히 지원 가능해요',
  'experience description must move into content data',
);
assert(
  sections.at(-1)?.title === '미디엄',
  'missing optional collection titles must use their visible fallback',
);

const keys = sections.flatMap((section) => [
  section._key,
  ...(section.body?.flatMap((block) => [
    block._key,
    ...block.children.map(({ _key }) => _key),
  ]) ?? []),
]);
assert(new Set(keys).size === keys.length, 'generated keys must be unique');

const plan = planDepartmentSections(fixture);
assert(plan.shouldPatch, 'legacy document must require a patch');
const migrated: RawDocument = {
  ...fixture,
  contentSchemaVersion: 2,
  sections: plan.sections,
};
const rerun = planDepartmentSections(migrated);
assert(!rerun.shouldPatch, 'migration rerun must be a no-op');

expectAbort(
  { ...fixture, sections: [] },
  'sections without contentSchemaVersion 2',
);
expectAbort(
  {
    ...fixture,
    skill: {
      ...(fixture.skill as Record<string, unknown>),
      notice: ['legacy notice'],
    },
  },
  'skill.notice contains unsupported content',
);
expectAbort(
  { ...fixture, contentSchemaVersion: 2, sections: null },
  'version 2 but sections is not an array',
);

const assertSectionType = (_section: TargetDepartmentSection) => true;
assert(
  sections.every(assertSectionType),
  'all sections must use the target type',
);

process.stdout.write('RS-MIG-02 department section check passed\n');
