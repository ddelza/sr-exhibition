---
name: exhibition-presentation-rounds
description: Design and wire up the "발표차시 정하기 → 1차발표(N차시) → 2차발표(N+1차시) → 동료평가 열람" flow for sr-exhibition — role self-selection, the fixed rotation formula that sends listeners around every other group exactly once, per-member + per-group peer-evaluation forms, and the post-presentation feedback/reflection exchange. Use this whenever 자극과 반응 전람회 (or any future 전람회-style unit in this repo) reaches its "발표 2회 돌려보기" phase and needs these pages rebuilt or extended for a new semester/class roster.
---

# 전람회 1차·2차 발표 + 동료평가 라운드 설계

매 학기 반복될 구조다(광수중 3학년 자극과 반응 전람회 기준으로 처음 구현: 2026-2학기,
`session6-1.html`/`session7-1.html`/`role-select.html`/`peer-eval-view.html`). 다음 학기에
같은 걸 다시 만들거나 확장할 때는 새로 설계하지 말고 이 문서를 따를 것.

## 전제 조건 (바뀔 수 있는 값들)

- 한 반(ban)에 **모둠이 몇 개인지**는 실제 배정 결과에 달려 있다. 이 구현은 로테이션 공식을
  일반 N(모둠 수)에 대해 계산하므로 5개가 아니어도 그대로 동작한다 — 하드코딩하지 말 것.
- 모둠원 4~5명이 "1차발표자/2차발표자"로 반씩 나뉜다는 전제. 인원이 갈라지는 정확한 비율은
  강제하지 않고 학생 각자 자율 선택(아래 참고).

## 전체 흐름

```
5차시(또는 이전 마지막 단계) 완료
   ↓
[발표차시 정하기] — 차시와 무관한 별도 페이지, 학생 각자 1차/2차 발표자 자율 선택
   ↓
[N차시: 1차발표]  — 이 선택을 그대로 적용
   ↓
[N+1차시: 2차발표] — 같은 선택인데 발표/청취 역할이 서로 뒤바뀜
   ↓
[동료평가 열람하기] — 두 차시 데이터를 합쳐서 "나에게 온 평가" / "우리 모둠에 온 평가"로 보여줌
```

핵심 설계 결정: **역할 선택은 한 번만 한다.** "1차발표자"/"2차발표자"라는 라벨은 그 학생의
고정된 정체성이고, 두 차시는 이 라벨을 각각 반대로 해석한다.

| | N차시(1차발표) | N+1차시(2차발표) |
|---|---|---|
| `role==='p1'`(1차발표자) | **발표** (모둠에 남음) | **청취** (다른 모둠 순회) |
| `role==='p2'`(2차발표자) | **청취** (다른 모둠 순회) | **발표** (모둠에 남음) |

각 페이지 상단에 `PRESENT_ROLE_THIS_SESSION` 상수 하나만 두고(`session6-1.html`은 `'p1'`,
`session7-1.html`은 `'p2'`), `myRole === PRESENT_ROLE_THIS_SESSION` 이면 발표 분기, 아니면
청취 분기 — 이 한 줄짜리 분기가 두 차시 페이지의 유일한 차이다. 페이지를 복제할 때 이 상수와
`SESSION_NUM`만 바꾸면 된다.

## 로테이션 공식 (청취 순서)

한 반의 모둠들을 **1차시 질문 게시 시각(`posts/{topicId}.ts`) 오름차순**으로 정렬해 배열
`order`를 만든다(항상 같은 순서가 나오도록 이 기준으로 고정 — 다른 정렬 기준을 쓰면 페이지마다
순서가 어긋난다). 내 모둠의 인덱스를 `myIndex`라 하면:

```js
function listenOrder(myIndex, total) {
  const out = [];
  for (let i = 1; i < total; i++) out.push((myIndex + i) % total);
  return out;
}
```

이 결과를 `order` 배열에 매핑하면 "내 모둠 바로 다음 모둠부터 순서대로, 내 모둠만 빼고 전부"가
나온다. 예시(5모둠, 0-indexed): `myIndex=0`→`[1,2,3,4]`, `myIndex=2`→`[3,4,0,1]`. 사용자가
준 표(1모둠→2,3,4,5 / 3모둠→4,5,1,2 등)와 정확히 일치함을 확인했다 — 새로 구현할 때도 이
공식으로 먼저 검증할 것.

**중요**: `computeGroupOrder(ban)`은 `session6-1.html`/`session7-1.html`/(향후 만들 교사용
페이지)에서 각각 독립적으로 계산되므로, 정렬 기준(post.ts)을 모든 파일에서 똑같이 써야 한다.
다르게 정렬하면 학생마다 로테이션이 어긋난다.

화면에는 내부 인덱스/번호를 그대로 노출하지 말고 각 대상 모둠의 **실험 제목이나 질문**으로
보여준다("N번째로 만날 모둠: OO모둠 질문") — 학생 입장에서 "모둠 3번" 같은 임의 번호보다
자기들이 붙인 제목이 훨씬 알아보기 쉽다.

## 데이터 모델

```
presentRole/{topicId}/{studentId}          = { role: 'p1'|'p2', updatedAt }   // 한 번만 쓰는 자율 선택
peerEval/{sessionNum}/perMember/{targetTopicId}/{targetStudentId}/{evaluatorId}
                                            = { evaluatorName, text, updatedAt }
peerEval/{sessionNum}/perGroup/{targetTopicId}/{evaluatorId}
                                            = { evaluatorName, scene, learned, updatedAt }
s{N}/wrapup/{topicId}/{studentId}          = { role?, text, updatedAt }   // 발표 후 소감/피드백
```

- `sessionNum`은 6 또는 7 (또는 향후 몇 차시든) — 두 세션의 평가 데이터가 같은 `peerEval` 트리
  아래 세션 번호로만 구분되므로, "동료평가 열람하기" 페이지는 두 세션 경로를 한 번에 fetch해서
  합치면 된다.
- **키를 evaluatorId로 둔 이유**: 같은 평가자가 폼을 다시 저장해도 새 자식이 늘어나지 않고
  덮어써진다(멱등). push-key를 쓰면 재저장할 때마다 중복이 쌓이므로 반드시 evaluatorId를 키로
  쓸 것.
- 문항1(모둠원별 설명·잘한점·아쉬운점)은 대상 모둠원 중 **그 차시에 실제로 발표하는 쪽만**
  걸러서 보여준다 — `presentRole/{targetTopicId}/{memberId}.role === PRESENT_ROLE_THIS_SESSION`
  로 필터링(6차시엔 `'p1'`, 7차시엔 `'p2'`). 처음엔 "역할 데이터가 불완전할 수 있으니 전원을
  보여주고 안내문으로 해결"하는 쪽으로 구현했다가, 실제 사용자 피드백으로 뒤집었다 — 발표에
  참여하지도 않은 모둠원까지 평가칸에 뜨는 게 더 헷갈린다는 것. 역할 데이터가 아예 없는 모둠은
  `members` 배열이 빈 채로 나오므로, "발표차시 정하기가 끝난 뒤 다시 확인해주세요" 같은 안내
  문구로 대체한다(전원을 보여주는 쪽으로 되돌리지 말 것).
- 문항2(인상깊은 장면)·문항3(알게 된 점)은 모둠 단위 1건이라 `perGroup`에 모둠원별 구분 없이
  평가자당 하나.

## 발표 후 피드백/성찰 교환 (step 4)

- N차시(1차발표) 종료 후: `role==='p1'`(방금 발표함)은 "2차발표자에게 남기고 싶은 피드백"을
  쓰고, `role==='p2'`(방금 청취하고 돌아옴)은 그 피드백을 읽은 뒤 "내 피드백 반영 계획"을
  쓴다 — 이건 **7차시에 내가 발표할 때를 대비한 예습**이라는 뜻이므로, 안내 문구에 "다음
  차시(발표할 때)"를 분명히 언급해야 학생이 왜 쓰는지 이해한다.
- N+1차시(2차발표) 종료 후: 이번엔 `role==='p2'`(방금 발표함, 원래 청취자였던 사람)만 "피드백을
  어떻게 반영했는지, 무엇이 성공적이었는지" 성찰을 쓴다. 대칭되는 "다음 차시 예습"은 없다 —
  두 차시로 끝나는 사이클이라 7차시엔 편도 성찰 하나만 필요하다. 청취자 쪽(`role==='p1'`)에는
  이 단계에서 쓸 게 없으니 폼 자체를 만들지 않는다.
- `wrapup` 항목은 **작성자 본인만 수정 가능**(다른 사람 항목은 읽기 전용) — 이 앱의 다른
  협업 필드들(2·3차시)은 모둠원 누구나 자유 편집이지만, 피드백/성찰은 "누가 누구에게 남기는
  개인적인 말"이라 자유 편집으로 하면 어색하다.

## 폴링 중 입력 유실 방지 (반드시 챙길 것)

이 페이지들은 한 화면에 **동시에 여러 개의 textarea**(모둠원별 평가칸 여러 개 + 문항2 +
문항3 + wrapup)가 떠 있을 수 있다. 5차시(`session5-1.html`)에서 실제로 겪은 사고: 포커스가
빠진 순간 폴링이 오면 입력 중이던 내용이 통째로 사라짐. 여기서는 필드별로 dirty 플래그를 따로
추적하는 대신, **컨테이너에 이벤트 위임으로 전역 `anyDirty` 플래그 하나**를 둔다:

```js
document.getElementById('content').addEventListener('input', function(e) {
  if (e.target.tagName === 'TEXTAREA') anyDirty = true;
});
```

이 리스너는 `render()` 밖, 스크립트 최상단에서 **한 번만** 등록한다(`#content` 자체는
`innerHTML` 교체에도 살아있으므로 이벤트 위임이 자식 재생성과 무관하게 계속 작동함). 폴링
함수는 `if (anyDirty) return;` 으로 재렌더를 건너뛰고, 저장 함수들은 성공 후 `anyDirty = false`
로 되돌린다. 정밀하게 필드 단위로 추적하지 않는 절충이지만(한 카드를 저장해도 다른 카드에
남은 미저장 입력까지 초기화됨), 이 앱의 실제 사용 패턴(한 번에 카드 하나씩 채움)에서는
충분히 안전하고 구현이 훨씬 단순하다.

## 재사용한 기존 패턴

- `requireSrLogin()` + `finalGroups/{studentId}`로 topicId 찾기 — 모든 세션 페이지 공통.
- 모둠원 목록 조합: `finalGroups` 전체를 topicId로 필터링 + `preferences`에서 이름/번호 보강.
- `.group-card`/`.post-hypo`/`.member-list`/`.expand-btn` 등 기존 CSS 클래스 그대로 재사용.
- 4차시(`s4/canvaLink`) 발표자료 링크, 5차시(`s5/finalScript`) 대본을 발표자 화면에 참고
  링크로 노출 — 이미 있는 데이터를 다시 입력받지 않고 재사용.

## 교사용 관리 페이지는 이번에 안 만들었음

`teacher6.html`/`teacher7.html`은 사용자가 명시적으로 요청하지 않아 이번 구현에 포함하지
않았다(이 저장소의 관례: 학생용 페이지 먼저 만들고, 교사용은 "teacherN.html도 만들어줘"라는
별도 요청이 왔을 때 추가 — 4·5차시도 이 순서로 진행됨). 다음에 필요해지면 `teacher4.html`/
`teacher5.html` 패턴(비밀번호 게이트 + 반 선택 + 모둠 카드 + 상세 펼치기 + 피드백)을 그대로
따르면 된다.
