import type { StructureResolver } from 'sanity/structure';

const singleton = (
  S: Parameters<StructureResolver>[0],
  title: string,
  schemaType: string,
  documentId: string,
) =>
  S.listItem()
    .id(documentId)
    .title(title)
    .child(
      S.document().schemaType(schemaType).documentId(documentId).title(title),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .id('content')
    .title('콘텐츠')
    .items([
      singleton(S, '메인 페이지', 'mainPage', 'mainPage'),
      S.listItem()
        .id('recruiting')
        .title('리크루팅')
        .child(
          S.list()
            .id('recruiting-content')
            .title('리크루팅')
            .items([
              singleton(S, '리크루팅 랜딩', 'recruitingPage', 'recruitingPage'),
              S.documentTypeListItem('department').title('부서 상세'),
              S.documentTypeListItem('recruitingSchedule').title(
                '공통 리크루팅 일정',
              ),
              S.documentTypeListItem('roadToPro').title('Road to Pro'),
            ]),
        ),
      singleton(S, '사이트 반영', 'buildTrigger', 'buildTrigger'),
    ]);
