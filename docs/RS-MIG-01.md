# RS-MIG-01 운영 런북

> 이 문서는 `refactor/recruit-schedule`의 S2 migration artifact를 운영자가 실행하기 위한 문서다. 이 에이전트는 production migration을 실행하지 않았다. 아래의 `--no-dry-run` 명령은 명시적인 운영자 승인과 점검 창에서만 실행한다.

## 0. 범위와 불변 조건

- 프로젝트: `f877vcud`, production dataset: `production`.
- 검증된 도구 버전: Studio package `sanity@6.9.2`, 설치된 CLI `@sanity/cli@7.18.0`, migration API: `sanity/migrate`. 버전과 help gate를 실행 결과에 보관하고, 값이 다르면 중지한다.
- migration ID는 `rs-mig-01-backfill`과 `rs-mig-01-cleanup`이다. `sanity migrations`는 검증된 CLI 7.18.0에서 지원되는 명령이다.
- backfill은 legacy O 문서 하나만 patch한다. baseline에서 생성된 선택 O/X가 `isActive`를 생략한 경우를 허용하되, O만 `true`로 보강하고 X는 생략 또는 `false`로 유지한다. 선택 X의 `true`/malformed 값과 unrelated schedule의 누락/비활성 외 상태는 abort한다. legacy X 문서와 legacy department 필드/문서는 보존한다. 새 target payload가 있는 O 문서를 다시 만들지 않는다.
- cleanup은 release 후 별도 승인으로만 실행한다. 정확히 검증된 X ID 삭제, backfill에서 처리한 정확한 department ID의 `applyProcedure` unset, 선택한 O 문서의 legacy root `formSchedule`/`procedure` unset만 허용한다.
- 이 migration은 새 스키마를 배포하거나 Gatsby/UI 동작을 바꾸지 않는다. S3 배포와 production 쓰기는 운영자 책임이다.

## 1. 파일과 안전장치

- `studio/migrations/rs-mig-01-backfill/index.ts`: 전체 입력을 먼저 읽고 preflight를 통과한 뒤 O 문서에 한 번의 patch를 만든다.
- `studio/migrations/rs-mig-01-backfill/lib.ts`: pair/mode/reference/date/procedure/target/allowlist 검증과 deterministic payload 생성.
- `studio/migrations/rs-mig-01-backfill/check.ts`: dependency-free 순수 check. individual override, O/X `isActive` 생략 호환, 재실행 no-op, partial cleanup recovery, O/X 충돌 abort를 검증한다.
- `studio/migrations/rs-mig-01-cleanup/index.ts`: backfill과 분리된 cleanup migration. 파일 안의 `manifest`는 빈 template이므로 운영자가 성공한 backfill report의 ID만 채워야 한다. 이 파일에 production ID를 커밋하지 않는다.

preflight는 async iterable migration의 첫 yield 전에 모든 `recruitingSchedule`/`department` 문서를 수집한다. 관련 문서 ID가 `drafts.`로 시작하면 선택 전에 즉시 abort한다. 따라서 preflight가 실패하면 mutation yield가 없어 write가 발생하지 않는다. Sanity runner는 mutation을 최대 256KB 요청 batch로 나누고 기본 동시성 6으로 제출한다. 원자성은 각 제출 batch/transaction 단위뿐이며 일부 batch만 commit되거나 실패/unknown outcome이 섞일 수 있다. `UnknownTransactionOutcome` 또는 부분 실패가 보이면 all-or-nothing으로 가정하거나 blind retry하지 말고 즉시 중지한다. fresh export와 inventory를 만들고 exact ID/field를 reconcile한 뒤 reviewer가 확인하고, idempotent migration을 검토 후 다시 실행한다.

## 2. 인증과 production export (repo 밖)

Sanity CLI 인증은 `.env`를 읽거나 복사하지 말고 operator 계정으로 수행한다. export/import 또는 migration 전에 repository 밖에서 아래 gate를 실행한다. 버전이 `sanity 6.9.2`/`@sanity/cli 7.18.0`과 다르거나, help에 필요한 문법이 없으면 실행하지 않는다. 이 gate는 import하지 않는다.

```bash
cd /Users/hyominkoo/Projects/yourssu.com
set -eu
pnpm --dir studio exec sanity versions | tee /tmp/rs-mig-01-sanity-versions.txt
grep -F '@sanity/cli (global)  7.18.0' /tmp/rs-mig-01-sanity-versions.txt
grep -F 'sanity                 6.9.2' /tmp/rs-mig-01-sanity-versions.txt
pnpm --dir studio exec sanity --version | grep -F '@sanity/cli/7.18.0'
pnpm --dir studio exec sanity migrations run --help | grep -F -- '--from-export'
pnpm --dir studio exec sanity migrations run --help | grep -F -- '--no-dry-run'
pnpm --dir studio exec sanity datasets import --help | grep -F -- '--missing'
if pnpm --dir studio exec sanity datasets import --help | grep -F -- '--no-assets'; then
  echo 'unsupported --no-assets appeared in import help' >&2
  exit 1
fi
```

```bash
cd /Users/hyominkoo/Projects/yourssu.com
pnpm --dir studio exec sanity login

export RS_EXPORT="/tmp/rs-mig-01-production-$(date +%Y%m%d-%H%M%S).tar.gz"
pnpm --dir studio exec sanity datasets export production "$RS_EXPORT" \
  --project-id f877vcud --no-assets --no-drafts --raw
shasum -a 256 "$RS_EXPORT"
tar -tzf "$RS_EXPORT" | head
```

export는 `/tmp` 등 repository 밖에 둔다. `.env`, token, Sanity secret을 export/archive/git에 넣지 않는다. 설치된 CLI는 `--from-export`와 execution 자체를 지원하지만, RS-MIG-01 정책은 export-backed 실행을 dry-run으로만 허용한다. `--no-drafts` export는 fixture/staging dry-run용이며, 실제 live migration은 CLI가 dataset export endpoint에서 읽으므로 write 전에 아래 live inventory도 다시 확인한다.

승인된 별도 staging dataset에서만 export를 import할 수 있다. production dataset을 target으로 쓰지 않는다.

```bash
pnpm --dir studio exec sanity datasets import "$RS_EXPORT" staging \
  --project-id f877vcud --missing
```

## 3. read-only inventory와 preflight

먼저 production을 읽어 정확한 ID/title, 활성 상태, legacy mode, 새 target payload를 보관한다. 이 명령은 query만 수행한다.

```bash
pnpm --dir studio exec sanity documents query \
  '*[_type in ["recruitingSchedule", "department"]] | order(_type asc, _id asc){_id, _type, title, isActive, basicInformation{name, isRecruiting}, applyProcedure, formSchedule, procedure, withAssignment, withoutAssignment}' \
  --project-id f877vcud --dataset production --api-version 2025-08-15 \
  > /tmp/rs-mig-01-inventory.json
```

export 또는 staging에서 먼저 읽기 전용 dry-run을 한다. 설치된 CLI help는 `--from-export`를 execution에도 허용하지만, RS-MIG-01 운영 정책상 export-backed 실행에는 `--no-dry-run`을 붙이지 않는다. 기본값이 dry mode다.

```bash
pnpm --dir studio exec sanity migrations run rs-mig-01-backfill \
  --from-export="$RS_EXPORT" --project=f877vcud --dataset=production \
  --no-confirm --no-progress
```

staging dataset을 준비했다면 export 대신 staging API를 읽을 수 있다.

```bash
pnpm --dir studio exec sanity migrations run rs-mig-01-backfill \
  --project=f877vcud --dataset=staging --no-confirm --no-progress
```

성공한 backfill dry-run은 `schedule-o` 하나에 `isActive`, `withAssignment`, `withoutAssignment` patch만 출력해야 한다. 다음은 반드시 abort되어야 한다.

1. title이 `... - 과제 O`/`... - 과제 X`인 legacy 문서가 각각 정확히 하나가 아님.
2. 두 title의 cycle prefix가 다름.
3. 선택 O/X를 제외한 unrelated schedule의 `isActive`가 `false`가 아니거나 새 target field를 가짐 (누락도 abort). 선택 X는 `isActive` 생략 또는 `false`만 허용하며, 선택 O는 생략을 허용하고 backfill에서 `true`로 설정한다.
4. O/X의 form date가 `YYYY-MM-DD`가 아니거나 실제 날짜가 아니고, procedure가 없거나 비어 있거나 step/schedule이 불완전함.
5. recruiting department의 legacy mode가 정확히 하나가 아님. mode 충돌/누락, individual detail 누락도 abort.
6. department reference/ID가 중복·누락이거나 target detail에 같은 department가 둘 이상 매핑됨.
7. O에 일부 target만 있거나 기존 target payload가 새로 계산한 payload와 다름.
8. inventory에 나온 예상 밖 active/target state.

오류에는 관련 schedule ID/title 및 department ID/name inventory가 포함된다. 실패하면 report를 보관하고 데이터를 수정한 뒤 처음부터 새 export와 dry-run을 만든다.

## 4. schema/content-update maintenance gate

migration 전에 merge 대상 코드와 Studio schema를 고정하고, production content editor의 일정/부서 편집을 중지한다. 먼저 local schema check와 Studio deploy preview를 실행한다.

```bash
pnpm --dir studio exec sanity schemas validate \
  --workspace default --level error
pnpm --dir studio exec sanity deploy --dry-run
```

이번 artifact는 schema shape를 새 모델로 바꾸는 S1과 함께 릴리스되는 전제다. 실제 Studio/schema 배포가 필요한 merge window에서만 다음을 실행한다.

```bash
pnpm --dir studio exec sanity schemas deploy --workspace default
pnpm --dir studio exec sanity deploy --yes
```

`schemas deploy`는 dry-run flag가 없는 설치 버전의 schema-store write 명령이므로 반드시 별도 승인 후 실행한다. GraphQL API 호환성 dry-run과 실제 GraphQL deploy는 release workflow가 담당한다. release에서는 다음 순서를 지킨다.

1. lint
2. typecheck
3. GraphQL compatibility dry-run
4. `sanity graphql deploy --force`
5. 환경 파일 생성/Gatsby build
6. S3 deploy
7. Studio deploy

release workflow의 GraphQL/Studio deploy 단계는 모두 `release` event에만 실행된다. `repository_dispatch` (`sanity-content-update`)는 두 deploy를 시도하지 않으므로, cutover maintenance gate에서는 GraphQL dry-run부터 S3/Studio 완료까지 content-update dispatch와 editor write를 멈추고 release 완료를 확인한 뒤 재개한다. build가 실패하면 normal step failure로 S3와 Studio 단계도 실행되지 않는다. 호환성 확인만 별도로 하려면 다음 read-only dry-run을 사용한다.

```bash
pnpm --dir studio exec sanity graphql deploy \
  --dry-run --dataset production
```

## 5. merge window backfill write

1. 직전 production inventory와 export hash를 저장한다.
2. maintenance gate에서 editor write를 멈춘다.
3. 위의 live read-only inventory와 export 기반 dry-run이 같은 O/X ID/title 및 department allowlist를 보고하는지 확인한다.
4. reviewer와 operator가 dry-run의 **유일한 write 대상이 legacy O ID**임을 확인한다.
5. interactive confirmation을 유지한 채 다음 write를 한 번 실행한다.

```bash
pnpm --dir studio exec sanity migrations run rs-mig-01-backfill \
  --project=f877vcud --dataset=production --progress
```

위 명령은 기본 dry mode이므로 실제 write가 필요한 경우에만 명시적으로 다음을 추가한다.

```bash
pnpm --dir studio exec sanity migrations run rs-mig-01-backfill \
  --project=f877vcud --dataset=production --progress --no-dry-run
```

`--no-dry-run`은 이 문서의 operator-only command다. 두 번째 명령 직전에 operator가 confirmation prompt와 target dataset을 재확인한다. 이 migration은 새 target fields와 `isActive`만 patch하므로 기존 title, legacy root `formSchedule`/`procedure`, X 문서, department 문서를 삭제하거나 수정하지 않는다.

write 직후 read-only query를 다시 실행한다. O에는 target 두 개와 `isActive: true`, X에는 기존 title/legacy payload가 남아 있어야 한다. 결과가 성공이거나 이미 같은 payload인 경우 backfill dry-run을 다시 실행하면 mutation 출력 없이 exit 0이어야 한다.

네트워크 timeout/unknown transaction outcome이면 retry 전에 export와 query로 O를 확인한다. O가 기대 payload와 완전히 같으면 no-op으로 간주하고, 다르면 즉시 중지하여 reviewer에게 보고한다. 임의의 `--replace`나 다른 문서 patch를 사용하지 않는다.

## 6. Gatsby merge/deploy와 live 확인

backfill이 끝난 뒤에만 Gatsby 변경을 merge하고, release artifact를 만든다.

```bash
pnpm build
find public/recruiting -mindepth 2 -maxdepth 2 -name index.html -print | sort
pnpm serve --host 127.0.0.1 --port 9000
```

별도 shell에서 대표 홈/모집/부서 URL을 확인한다. 실제 department path는 위 `find` 결과와 production inventory의 이름으로 operator가 대체한다.

```bash
curl --fail --silent --show-error http://127.0.0.1:9000/ >/dev/null
curl --fail --silent --show-error \
  http://127.0.0.1:9000/recruiting/<verified-department-path>/ >/dev/null
```

승인된 release deploy는 기존 GitHub Actions workflow를 사용한다. workflow는 lint/typecheck를 먼저 끝낸 뒤 GraphQL compatibility dry-run과 실제 GraphQL deploy를 실행하고, checks/env/Gatsby build 성공 시에만 S3를 deploy한 다음 Studio를 deploy한다. 자동 rollback은 수행하지 않는다. S3 단계의 기존 command는 다음과 같다.

```bash
pnpm deploy
```

`repository_dispatch` content-update run은 GraphQL/Studio deploy 없이 checks/build/S3만 수행하므로, cutover 중에는 section 4의 maintenance gate로 dispatch를 멈춘다. 배포 후 production page에서 모집 일정/지원 절차/individual override를 확인하고, Sanity에서도 exact ID를 read-only query한다. GraphQL deploy 후 build가 실패하면 S3/Studio와 cleanup을 실행하지 않고 previous Gatsby release로 수동 reconcile한다. 자동 rollback은 없다.

## 7. release 후 cleanup

cleanup은 live page 확인, previous export 보관, operator의 명시적 승인 이후에만 실행한다. cleanup 시작부터 cleanup write 직후의 fresh inventory/query와 final verification이 끝날 때까지 editor/content update freeze를 유지한다. cleanup file의 `manifest`에 성공한 backfill report의 다음 값만 채운다.

```ts
const manifest: CleanupManifest = {
  backfillTargetFingerprint:
    '<backfill report의 exact O ID/title/new fields fingerprint>',
  departmentIds: ['<backfill report의 exact department IDs>'],
  legacyOId: '<backfill report의 exact O ID>',
  legacyXId: '<backfill report의 exact X ID>',
  removeLegacyRoots: false,
};
```

이 변경은 production ID template이므로 commit하지 않는다.
`backfillTargetFingerprint`는 backfill report가 계산한 O의 exact
ID/title/`withAssignment`/`withoutAssignment` payload fingerprint다. 첫 cleanup과
X 삭제 후 rerun 모두 이 fingerprint를 비교한다. `departmentIds`는 “모든
department”가 아니라 backfill이 mode를 확인하고 target에 실제로 매핑한 ID의
정렬 가능한 exact allowlist여야 한다. `removeLegacyRoots`는 기본 `false`다.
release가 legacy root를 더 이상 읽지 않는 것을 확인하고 별도 승인을 받은
경우에만 `true`로 바꾼다.

먼저 cleanup 직전 fresh export와 inventory/query를 만들고 dry-run한다.

```bash
export RS_CLEANUP_EXPORT="/tmp/rs-mig-01-pre-cleanup-$(date +%Y%m%d-%H%M%S).tar.gz"
pnpm --dir studio exec sanity datasets export production "$RS_CLEANUP_EXPORT" \
  --project-id f877vcud --no-assets --no-drafts --raw
shasum -a 256 "$RS_CLEANUP_EXPORT"
pnpm --dir studio exec sanity documents query \
  '*[_type in ["recruitingSchedule", "department"]] | order(_type asc, _id asc){_id, _type, title, isActive, applyProcedure, formSchedule, procedure, withAssignment, withoutAssignment}' \
  --project-id f877vcud --dataset production --api-version 2025-08-15 \
  > /tmp/rs-mig-01-pre-cleanup-inventory.json

pnpm --dir studio exec sanity migrations run rs-mig-01-cleanup \
  --from-export="$RS_CLEANUP_EXPORT" --project=f877vcud --dataset=production \
  --no-confirm --no-progress
```

첫 cleanup dry-run에서 허용되는 출력은 정확한 `legacyXId` 하나의 delete, allowlist department들의 `applyProcedure` unset, `removeLegacyRoots=true`일 때만 O root 두 field unset이다. 새 `withAssignment`/`withoutAssignment`와 O의 `isActive`는 출력에 없어야 한다. ID/allowlist mismatch, O/X state mismatch, 다른 X 존재, department 누락이면 abort한다.

operator가 dry-run과 live verification을 확인하고, freeze를 유지한 채 **no-dry-run 직전에 fresh inventory/query를 한 번 더 실행**한 후에만 write한다. 이 native migration에는 revision guard를 추가하지 않는다.

```bash
pnpm --dir studio exec sanity documents query \
  '*[_type in ["recruitingSchedule", "department"]] | order(_type asc, _id asc){_id, _type, title, isActive, applyProcedure, formSchedule, procedure, withAssignment, withoutAssignment}' \
  --project-id f877vcud --dataset production --api-version 2025-08-15 \
  > /tmp/rs-mig-01-immediately-before-cleanup-write.json
pnpm --dir studio exec sanity migrations run rs-mig-01-cleanup \
  --project=f877vcud --dataset=production --progress --no-dry-run
```

write 후 freeze를 유지한 채 fresh export와 inventory/query를 다시 만들고 같은 manifest로 cleanup dry-run을 다시 실행한다. exit 0이며 mutation 출력이 없어야 한다. 이것이 두 번째 cleanup no-op 증거다. 최종 verification을 완료하고 reviewer/operator가 확인한 뒤에만 editor/content update freeze를 해제한다. backfill도 enriched O export에서 두 번째 dry-run을 실행해 mutation 출력이 없는지 확인한다.

## 8. rollback

### Gatsby/Studio release rollback

content cleanup 전이라면 previous Gatsby release artifact를 다시 배포하고 Studio deploy를 previous known-good release로 되돌린다. 새 O target fields와 legacy data가 함께 있으므로 old Gatsby가 legacy data를 다시 읽을 수 있는지 release compatibility를 먼저 확인한다. cleanup 후에는 old release가 삭제된 X/`applyProcedure`/legacy root를 요구할 수 있으므로 content rollback도 함께 해야 한다.

### backfill rollback (cleanup 전)

backfill 직전 export에서 exact O 문서를 추출해, operator가 freeze와 current `_updatedAt`를 확인한 뒤 exact ID 하나만 restore한다. 전체 dataset을 `--replace` import하지 않는다.

```bash
# RS_EXPORT는 backfill 직전 export, O_ID는 dry-run report의 exact O ID
export O_ID='<exact legacy O ID>'
tar -xOzf "$RS_EXPORT" data.ndjson \
  | jq -c "select(._id == \"$O_ID\")" \
  > /tmp/rs-mig-01-rollback-o.ndjson
pnpm --dir studio exec sanity documents create \
  /tmp/rs-mig-01-rollback-o.ndjson --project-id f877vcud \
  --dataset production --replace
```

이 명령은 해당 문서 전체를 export snapshot으로 replace하므로, export 이후 O에 추가된 정상 편집을 덮을 수 있다. 따라서 maintenance freeze, current document diff/`_updatedAt` 확인, operator 승인 없이 실행하지 않는다. backfill은 O 하나만 썼으므로 department rollback은 필요하지 않다.

### cleanup rollback (cleanup 후)

cleanup 직전 `RS_CLEANUP_EXPORT`를 보관했다면, exact X 문서와 backfill allowlist의 exact department snapshot만 staging에서 먼저 검증한다. production에 복원할 때도 `documents create --replace`를 exact IDs에만 사용하고 전체 export import는 금지한다.

```bash
export X_ID='<manifest의 exact legacy X ID>'
tar -xOzf "$RS_CLEANUP_EXPORT" data.ndjson \
  | jq -c "select(._id == \"$X_ID\")" \
  > /tmp/rs-mig-01-rollback-x.ndjson
pnpm --dir studio exec sanity documents create \
  /tmp/rs-mig-01-rollback-x.ndjson --project-id f877vcud \
  --dataset production --replace
```

`applyProcedure` 복원은 cleanup 직전 export에서 manifest의 exact department IDs만 추출해 별도 검증한 뒤 exact document replace를 한다. 다른 department를 포함한 파일을 만들지 않는다. snapshot이 현재 문서와 다르면 중지하고 Sanity document history/backup restore 절차로 처리한다.

```bash
# 예: exact department 하나만 추출한다. <DEPT_ID>를 manifest의 allowlist 값으로 대체한다.
tar -xOzf "$RS_CLEANUP_EXPORT" data.ndjson \
  | jq -c 'select(._id == "<DEPT_ID>")' \
  > /tmp/rs-mig-01-rollback-department.ndjson
pnpm --dir studio exec sanity documents create \
  /tmp/rs-mig-01-rollback-department.ndjson --project-id f877vcud \
  --dataset production --replace
```

rollback 후 exact ID query, Gatsby build/page check, 그리고 새 release의 schema/content compatibility를 다시 확인한다.

## 9. no-op/실행 금지 체크리스트

- 매 실행 전에 버전/help gate를 통과하고 결과를 operator-local log로 보관한다. 현재 검증값은 `sanity@6.9.2`와 `@sanity/cli@7.18.0`이다.
- migration runner의 batch는 최대 256KB, 기본 동시성은 6이며 전체 migration
  all-or-nothing이 아니다. 부분/unknown commit이면 중지 → fresh
  export/inventory → exact ID/field reconcile → reviewer 확인 → idempotent rerun
  순서를 지킨다. blind retry하지 않는다.
- `sanity migrations run`은 기본 dry mode다. read-only/preflight/staging에서는 `--no-dry-run`을 사용하지 않는다.
- 이 agent는 production migration, schema deploy, dataset import, S3 deploy, secrets export를 실행하지 않았다.
- migration source/target에 대한 예상 밖 문서가 있으면 선택하거나 자동 비활성화하지 않고 abort한다.
- cleanup manifest가 빈 template인 상태로는 실행되지 않는다. operator가 exact IDs를 채우고 검증해야 한다.
- 두 번째 backfill dry-run과 두 번째 cleanup dry-run은 각각 mutation 0건이어야 한다.
