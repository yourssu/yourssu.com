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
        .title('리쿠르팅')
        .child(
          S.list()
            .id('recruiting-content')
            .title('리쿠르팅')
            .items([
              singleton(S, '리쿠르팅 랜딩', 'recruitingPage', 'recruitingPage'),
              S.documentTypeListItem('department').title('부서 상세'),
              S.documentTypeListItem('recruitingSchedule').title(
                '공통 리쿠르팅 일정',
              ),
              S.documentTypeListItem('roadToPro').title('Road to Pro'),
            ]),
        ),
      S.listItem()
        .id('operations')
        .title('운영')
        .child(
          S.list()
            .id('operations-content')
            .title('운영')
            .items([
              S.documentTypeListItem('buildTrigger').title('Last Update'),
            ]),
        ),
    ]);
