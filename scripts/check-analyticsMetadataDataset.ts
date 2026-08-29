import 'dotenv/config';

import {
  planAnalyticsMetadata,
  type RawDocument,
} from '../studio/migrations/spr-124-analytics-metadata-backfill/lib';

const projectId = process.env.GATSBY_APP_SANITY_PROJECT_ID;
const dataset = process.env.GATSBY_APP_SANITY_DATASET;
const token = process.env.GATSBY_APP_SANITY_TOKEN;
const allowPending = process.argv.includes('--allow-pending');

if (!projectId || !/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error('GATSBY_APP_SANITY_PROJECT_ID is missing or invalid.');
}
if (!dataset || !/^[a-z0-9_-]+$/.test(dataset)) {
  throw new Error('GATSBY_APP_SANITY_DATASET is missing or invalid.');
}

const query = `
  *[
    _type in ["department", "mainPage", "recruitingPage"] &&
    !(_id in path("drafts.**"))
  ] {
    _id,
    _type,
    basicInformation,
    product,
    channel,
    faq
  }
`;

const endpoint = new URL(
  `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
);
endpoint.searchParams.set('query', query);

async function main() {
  const response = await fetch(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(
      `Sanity analytics metadata query failed (${response.status}).`,
    );
  }

  const payload = (await response.json()) as { result?: RawDocument[] };
  const documents = payload.result;
  if (!Array.isArray(documents)) {
    throw new Error(
      'Sanity analytics metadata query returned no document list.',
    );
  }

  const typeCounts = new Map<string, number>();
  for (const document of documents) {
    const type = String(document._type);
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
  }
  if (
    typeCounts.get('mainPage') !== 1 ||
    typeCounts.get('recruitingPage') !== 1
  ) {
    throw new Error(
      'Expected exactly one published mainPage and recruitingPage document.',
    );
  }
  if (!typeCounts.get('department')) {
    throw new Error('Expected at least one published department document.');
  }

  const plans = documents.map(planAnalyticsMetadata);
  const pending = plans.filter(({ shouldPatch }) => shouldPatch);
  if (pending.length && !allowPending) {
    throw new Error(
      `${pending.length} Sanity documents still need the SPR-124 analytics metadata backfill.`,
    );
  }

  const suffix = pending.length
    ? `; ${pending.length} document(s) require backfill`
    : '';
  process.stdout.write(
    `Sanity analytics metadata check passed (${documents.length} documents${suffix})\n`,
  );
}

void main();
