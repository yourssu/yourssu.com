export type RawDocument = {
  _id?: unknown;
  _type?: unknown;
  [key: string]: unknown;
};

type RawRecord = Record<string, unknown>;

type PortableTextSpan = {
  _key: string;
  _type: 'span';
  marks: string[];
  text: string;
};

type PortableTextBlock = {
  _key: string;
  _type: 'block';
  children: PortableTextSpan[];
  level?: number;
  listItem?: 'bullet';
  markDefs: unknown[];
  style: 'h3' | 'normal';
};

export type TargetDepartmentSection = {
  _key: string;
  _type: 'departmentSection';
  articles?: unknown[];
  body?: PortableTextBlock[];
  description?: string;
  faqList?: unknown[];
  kind:
    | 'applyProcedure'
    | 'articles'
    | 'faq'
    | 'quote'
    | 'richText'
    | 'roadToPro';
  quoteText?: string;
  roadToProList?: unknown[];
  title: string;
};

export type DepartmentSectionsPlan = {
  documentId: string;
  sections: TargetDepartmentSection[];
  shouldPatch: boolean;
};

const STRONG_PATTERN = /\*\*([\s\S]+?)\*\*/g;

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (value: object, key: string) => Object.hasOwn(value, key);

const keyPart = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, '_');

const documentId = (document: RawDocument) => {
  if (typeof document._id !== 'string' || !document._id.trim()) {
    throw new Error('Department migration aborted: document ID is missing.');
  }
  return document._id;
};

const requiredText = (value: unknown, path: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Department migration aborted: ${path} is missing.`);
  }
  return value;
};

const optionalArray = (value: unknown, path: string): unknown[] | null => {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value)) {
    throw new Error(`Department migration aborted: ${path} must be an array.`);
  }
  return value;
};

const spansFromText = (text: string, keyPrefix: string): PortableTextSpan[] => {
  const normalized = text.replaceAll('\\n', '\n');
  const spans: PortableTextSpan[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  STRONG_PATTERN.lastIndex = 0;

  while ((match = STRONG_PATTERN.exec(normalized))) {
    if (match.index > cursor) {
      spans.push({
        _key: `${keyPrefix}-span-${spans.length}`,
        _type: 'span',
        marks: [],
        text: normalized.slice(cursor, match.index),
      });
    }
    spans.push({
      _key: `${keyPrefix}-span-${spans.length}`,
      _type: 'span',
      marks: ['strong'],
      text: match[1],
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < normalized.length || spans.length === 0) {
    spans.push({
      _key: `${keyPrefix}-span-${spans.length}`,
      _type: 'span',
      marks: [],
      text: normalized.slice(cursor),
    });
  }
  return spans;
};

export const legacyContentToBlocks = (
  content: unknown,
  keyPrefix: string,
): PortableTextBlock[] => {
  const items = optionalArray(content, `${keyPrefix}.content`);
  if (!items) return [];

  return items.map((item, index) => {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error(
        `Department migration aborted: ${keyPrefix}.content[${index}] must be a non-empty string.`,
      );
    }
    const blockKey = `${keyPrefix}-block-${index}`;
    const heading = /^\[([^\]]+)\]$/.exec(item);
    if (heading) {
      return {
        _key: blockKey,
        _type: 'block',
        children: spansFromText(heading[1], blockKey),
        markDefs: [],
        style: 'h3',
      };
    }
    return {
      _key: blockKey,
      _type: 'block',
      children: spansFromText(item, blockKey),
      level: 1,
      listItem: 'bullet',
      markDefs: [],
      style: 'normal',
    };
  });
};

const richTextSection = (
  document: RawDocument,
  fieldName: string,
  description?: string,
): TargetDepartmentSection | null => {
  const value = document[fieldName];
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) {
    throw new Error(
      `Department migration aborted: ${documentId(document)}.${fieldName} must be an object.`,
    );
  }
  const id = documentId(document);
  const sectionKey = keyPart(`${id}-${fieldName}`);
  const body = legacyContentToBlocks(value.content, sectionKey);
  if (body.length === 0) return null;

  return {
    _key: sectionKey,
    _type: 'departmentSection',
    body,
    ...(description ? { description } : {}),
    kind: 'richText',
    title: requiredText(value.title, `${id}.${fieldName}.title`),
  };
};

const quoteSection = (
  document: RawDocument,
): TargetDepartmentSection | null => {
  const value = document.inaWord;
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) {
    throw new Error(
      `Department migration aborted: ${documentId(document)}.inaWord must be an object.`,
    );
  }
  if (value.word === undefined || value.word === null || value.word === '') {
    return null;
  }
  const id = documentId(document);
  return {
    _key: keyPart(`${id}-inaWord`),
    _type: 'departmentSection',
    kind: 'quote',
    quoteText: requiredText(value.word, `${id}.inaWord.word`),
    title: requiredText(value.title, `${id}.inaWord.title`),
  };
};

const collectionSection = (
  document: RawDocument,
  sourceField: 'FAQ' | 'medium' | 'roadToProVideo',
  sourceListField: 'FAQList' | 'article' | 'roadToPro_list',
  target:
    | { kind: 'articles'; listField: 'articles' }
    | { kind: 'faq'; listField: 'faqList' }
    | { kind: 'roadToPro'; listField: 'roadToProList' },
): TargetDepartmentSection | null => {
  const value = document[sourceField];
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) {
    throw new Error(
      `Department migration aborted: ${documentId(document)}.${sourceField} must be an object.`,
    );
  }
  const list = optionalArray(
    value[sourceListField],
    `${documentId(document)}.${sourceField}.${sourceListField}`,
  );
  if (!list?.length) return null;

  const id = documentId(document);
  const defaultTitle = {
    FAQ: 'FAQ',
    medium: '미디엄',
    roadToProVideo: 'Road to Pro',
  }[sourceField];
  const title =
    typeof value.title === 'string' && value.title.trim()
      ? value.title
      : defaultTitle;

  return {
    _key: keyPart(`${id}-${sourceField}`),
    _type: 'departmentSection',
    kind: target.kind,
    [target.listField]: list,
    title,
  };
};

const assertUnusedSkillNoticeIsEmpty = (document: RawDocument) => {
  if (!isRecord(document.skill)) return;
  const notice = optionalArray(
    document.skill.notice,
    `${documentId(document)}.skill.notice`,
  );
  if (notice?.length) {
    throw new Error(
      `Department migration aborted: ${documentId(document)}.skill.notice contains unsupported content.`,
    );
  }
};

export const buildDepartmentSections = (
  document: RawDocument,
): TargetDepartmentSection[] => {
  const id = documentId(document);
  assertUnusedSkillNoticeIsEmpty(document);

  const candidates: (TargetDepartmentSection | null)[] = [
    richTextSection(document, 'task'),
    richTextSection(document, 'growthAndDiff'),
    richTextSection(document, 'ideal'),
    richTextSection(
      document,
      'experience',
      '아래 내용에 모두 해당하지 않아도 충분히 지원 가능해요',
    ),
    richTextSection(document, 'skill'),
    {
      _key: keyPart(`${id}-applyProcedure`),
      _type: 'departmentSection',
      kind: 'applyProcedure',
      title: '합류 여정',
    },
    quoteSection(document),
    collectionSection(document, 'FAQ', 'FAQList', {
      kind: 'faq',
      listField: 'faqList',
    }),
    collectionSection(document, 'roadToProVideo', 'roadToPro_list', {
      kind: 'roadToPro',
      listField: 'roadToProList',
    }),
    collectionSection(document, 'medium', 'article', {
      kind: 'articles',
      listField: 'articles',
    }),
  ];

  return candidates.filter(
    (section): section is TargetDepartmentSection => section !== null,
  );
};

export const planDepartmentSections = (
  document: RawDocument,
): DepartmentSectionsPlan => {
  const id = documentId(document);
  if (document._type !== 'department') {
    throw new Error(
      `Department migration aborted: ${id} is not a department document.`,
    );
  }

  if (document.contentSchemaVersion === 2) {
    if (!Array.isArray(document.sections)) {
      throw new Error(
        `Department migration aborted: ${id} is version 2 but sections is not an array.`,
      );
    }
    return {
      documentId: id,
      sections: document.sections as TargetDepartmentSection[],
      shouldPatch: false,
    };
  }

  if (document.contentSchemaVersion !== undefined) {
    throw new Error(
      `Department migration aborted: ${id} has unsupported contentSchemaVersion ${String(document.contentSchemaVersion)}.`,
    );
  }
  if (hasOwn(document, 'sections')) {
    throw new Error(
      `Department migration aborted: ${id} has sections without contentSchemaVersion 2.`,
    );
  }

  return {
    documentId: id,
    sections: buildDepartmentSections(document),
    shouldPatch: true,
  };
};
