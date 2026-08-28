# PostHog 네이티브 이벤트 운영

SPR-124는 GTM의 PostHog 커스텀 이벤트 13개를 같은 이름과 핵심 속성으로
이전하고, FAQ 및 스크롤 이벤트 4개를 추가한다. 이벤트 함수는
`src/analytics/events.ts`에 명시적으로 정의되며 UI는 이벤트명 문자열을 직접
전달하지 않는다. SPR-132는 이 계약을 유지하면서 모집 카드 노출과 리크루팅 FAQ
문의 이벤트 2개 및 분석 속성을 보강한다.

## 환경 설정과 프로덕션 전환 순서

모든 값은 Gatsby 빌드 시 주입되는 공개 클라이언트 환경변수다. 실제 프로젝트
키와 ingestion host는 저장소에 커밋하지 않는다.

```dotenv
GATSBY_APP_POSTHOG_DEPLOYMENT_ENV=development
GATSBY_APP_POSTHOG_KEY=<environment-project-key>
GATSBY_APP_POSTHOG_HOST=<environment-ingestion-host>
```

- 유효한 project key와 ingestion host가 모두 있으면 SDK가 항상 초기화된다.
- `GATSBY_APP_POSTHOG_DEPLOYMENT_ENV=production`에서는 HTTPS host만 허용한다.
- `GATSBY_APP_POSTHOG_DEPLOYMENT_ENV=staging`은 별도 프로젝트에서 검증할 때
  사용한다.
- 배포 환경을 생략한 production 빌드는 안전하게 `production`으로 간주한다.

별도 capture 활성화 플래그는 없다. 따라서 SPR-125의 GTM PostHog 초기화 및
13개 이벤트 태그 정리 준비를 완료한 뒤에만 SPR-124를 병합하고 프로덕션 릴리스를
진행한다. GTM 태그 중지·게시와 네이티브 코드 배포는 같은 전환 창에서 수행하며,
SPR-124 자체에서는 GTM 컨테이너를 수정하거나 게시하지 않는다.

개발과 스테이징에서는 별도 PostHog 프로젝트 키를 사용한다. 키나 host가 없거나
host 형식이 유효하지 않으면 capture는 조용히 비활성화된다. 모듈과 HMR이 다시
평가되어도 전역 초기화 상태를 확인해 SDK를 한 번만 초기화한다.

## 이벤트 계약

| 이벤트                               | 발생 위치                                          | 핵심 속성                                                                                           |
| ------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `landing_page_viewed`                | 세션 최초 진입 URL에 유효한 `utm_source`가 있을 때 | `source`, `medium`, `campaign`, `term`, `content`                                                   |
| `main_page_viewed`                   | `/` 라우트 진입                                    | 없음                                                                                                |
| `main_tf_card_click`                 | 메인 제품 카드                                     | `tf_name`                                                                                           |
| `main_recruiting_cta_click`          | 메인 Header, Hero, 하단 CTA                        | `cta_location`, `cta_label`                                                                         |
| `main_recruiting_content_card_click` | 메인 채널 콘텐츠 카드                              | `category`, `content_type`, `content_id`, `content_position`                                        |
| `footer_social_icon_click`           | Footer 소셜 링크                                   | `content_type`                                                                                      |
| `recruiting_page_viewed`             | `/recruiting/` 라우트 진입                         | `recruitment_cycle_id`                                                                              |
| `recruiting_jd_card_click`           | 모집 부서 카드                                     | `team_name`, `recruitment_cycle_id`                                                                 |
| `recruiting_jd_card_impression`      | 활성 모집 카드가 뷰포트에 50% 이상 노출            | `team_name`, `card_position`, `recruitment_cycle_id`                                                |
| `recruiting_contact_click`           | 리크루팅 마지막 FAQ 답변의 문의 링크               | `faq_key`, `cta_location=faq_answer`, `recruitment_cycle_id`                                        |
| `jd_page_viewed`                     | `/recruiting/{department}` 라우트 진입             | `team_name`, `recruitment_cycle_id`                                                                 |
| `jd_apply_click`                     | 활성화된 데스크톱·모바일 외부 지원 폼 링크         | `team_name`, `cta_location`, `recruitment_cycle_id`                                                 |
| `jd_to_faq_click`                    | JD의 FAQ 바로가기                                  | `team_name`, `cta_location`, `recruitment_cycle_id`                                                 |
| `jd_external_content_card_click`     | JD의 미디엄·영상 링크                              | `page_type`, `content_type`, `team_name`, `content_id`, `content_position`, `recruitment_cycle_id`  |
| `jd_contact_click`                   | JD의 문의 링크                                     | `team_name`, `cta_location`, `recruitment_cycle_id`                                                 |
| `faq_toggle_click`                   | 리크루팅·JD FAQ 항목 열기 또는 닫기                | `faq_key`, `faq_position`, `toggle_action`, `page_type`, `recruitment_cycle_id`, 선택적 `team_name` |
| `main_scroll_depth_reached`          | 메인 50·70·90% 최초 통과                           | `scroll_percent`                                                                                    |
| `recruiting_scroll_depth_reached`    | 리크루팅 50·70·90% 최초 통과                       | `scroll_percent`, `recruitment_cycle_id`                                                            |
| `jd_scroll_depth_reached`            | JD 50·70·90% 최초 통과                             | `scroll_percent`, `team_name`, `recruitment_cycle_id`                                               |

모든 네이티브 이벤트에는 `tracking_source=native`와 `tracking_version=2`가
추가된다. 최초 UTM 값은 `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
`utm_content` 세션 속성으로 등록되어 같은 탭의 새로고침과 후속 SPA 이동에서도
유지된다. PostHog 세션 ID가 바뀌면 새 진입 URL을 기준으로 UTM 컨텍스트를 다시
시작한다. 세션 변경 콜백에서 새 UTM 세션 속성을 즉시 등록하므로, 비활성 시간
초과로 세션 교체를 일으킨 첫 이벤트에도 새 컨텍스트가 포함된다. URL 속성은
query와 hash를 제거한 뒤 전송한다.

`recruitment_cycle_id`는 활성 `recruitingSchedule` Sanity 문서의 `_id`를
사용한다. 리크루팅 정적 페이지와 빌드 시 생성되는 JD 페이지가 같은 문서 ID를
렌더링하고, 라우트 페이지뷰·FAQ·스크롤·CTA·카드 이벤트가 이를 공유한다.
리크루팅과 JD의 `$pageview`에도 같은 속성을 추가한다. 콘텐츠 식별자는 메인과
미디엄 객체의 Sanity `_key`, Road to Pro 참조 문서의 `_id`를 사용하며 위치는
화면에 렌더링된 목록 기준 1부터 시작한다. JD CTA 위치는
`desktop_sidebar`와 `mobile_sticky` 중 하나다.

JD URL 팀 매핑은 기존 정책대로 Product Manager와 Backend Engineer를 포함하지
않는다. 이 경로들의 JD 이벤트는 기존 fallback 값인 `none`을 사용한다. 반면
리크루팅 카드 클릭 매핑에는 두 팀이 계속 포함된다.

## 중복 방지와 검증

Gatsby `onRouteUpdate` 한 곳만 `$pageview`와 페이지별 커스텀 이벤트를 담당한다.
같은 pathname에 연속으로 들어오는 콜백과 query/hash만 바뀐 콜백은 무시하고,
다른 경로를 거쳐 돌아오면 새 진입으로 수집한다. 스크롤 임계값 상태는 pathname
전환 때 초기화된다. `/recruiting/*` 형태의 404처럼 모집 주기 ID가 없는 경로도
일반 `$pageview`는 한 번 수집하지만 모집 전용 이벤트와 스크롤 이벤트는 생략한다.
모집 카드 노출은 `IntersectionObserver`의 0.5 임계값을
사용하며 같은 브라우저 런타임에서 정규화된 pathname과 Sanity 카드 `_key` 조합을
한 번만 수집한다. 전체 새로고침은 새 런타임이므로 다시 수집할 수 있다.

```bash
pnpm test:analytics
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```

테스트 프로젝트에서 직접 진입, 새로고침, Gatsby Link 이동을 각각 확인하고
PostHog 네트워크 요청에서 `$pageview`와 페이지 커스텀 이벤트가 한 번씩인지
검증한다. `jd_apply_click`은 외부 지원 폼으로 이동하려는 클릭만 의미하며 폼
제출·저장·이탈 또는 응답자 연결을 의미하지 않는다.
