/**
 * 9차시 성찰일지 실전용 구글 설문지를 새로 만든다.
 * script.google.com에서 새 프로젝트 만들고 이 코드를 붙여넣은 뒤,
 * createReflectionForm 함수를 실행하면 된다(첫 실행 시 권한 승인 필요).
 * 실행 로그(보기 > 실행 기록, 또는 Logger 출력)에 설문지/응답시트 링크가 뜬다.
 *
 * 문항은 session8-1.html(8차시 연습용 페이지)과 완전히 동일하게 맞췄다 —
 * 8차시에서 연습한 그대로, 9차시엔 외워서 적기만 하면 된다.
 */
function createReflectionForm() {
  const form = FormApp.create('자극과 반응 전람회 · 성찰일지 (9차시)');
  form.setDescription(
    '전람회 탐구·전시를 되돌아보며 성찰일지를 작성합니다.\n' +
    '· 모둠 활동이 아닌 개인 작성입니다. 8차시에 연습한 내용을 떠올려 자신의 경험을 바탕으로 적어주세요.\n' +
    '· 교과서 문장을 그대로 옮기지 말고, 나만의 언어로 작성해주세요.'
  );
  form.setCollectEmail(true);        // 응답자의 학교 계정 이메일을 함께 기록(신원 대조용)
  form.setLimitOneResponsePerUser(true); // 계정당 1회만 제출 가능(로그인 필요)
  form.setShuffleQuestions(false);

  // ── 기본 정보 ─────────────────────────────────────────
  form.addSectionHeaderItem().setTitle('기본 정보');
  form.addTextItem()
    .setTitle('학번 (4자리, 예: 3115)')
    .setValidation(
      FormApp.createTextValidation()
        .setHelpText('학번 4자리 숫자로 입력해주세요. 예) 3학년 1반 15번 → 3115')
        .requireTextMatchesPattern('^\\d{4}$')
        .build()
    )
    .setRequired(true);
  form.addTextItem().setTitle('이름').setRequired(true);

  // ── ① 지식 내재화하기 (2점) ───────────────────────────
  form.addSectionHeaderItem().setTitle('① 지식 내재화하기 (2점)');
  form.addParagraphTextItem()
    .setTitle('우리 탐구 결과, 왜 그런 현상이 일어나는지 설명해주는 과학적 원리(원인-결과 관계)는 무엇인가?')
    .setHelpText('💡 3차시 ② 탐구 결과 정리에서 썼던 "④ 원리 탐구하기" 내용을 떠올려 적어보자.')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('그 원리를 과학을 잘 모르는 친구나 동생에게 설명해준다면, 어떻게 쉽게 풀어서 이야기해줄 수 있을까?')
    .setHelpText('💡 교과서 문장이 아니라 나만의 표현으로. (4차시 발표자료, 5차시 대본을 참고하되, 비유·쉬운 단어로 바꾸는 건 직접 고민해서)')
    .setRequired(true);

  // ── ② 탐구 과정 및 논리 점검하기 (단답형, 짧게 써도 됨) ──
  form.addSectionHeaderItem().setTitle('② 탐구 과정 및 논리 점검하기 (단답형, 짧게 써도 됨)');
  form.addTextItem()
    .setTitle('처음에 어떤 질문(궁금증)에서 이 탐구를 시작했나?')
    .setHelpText('💡 2차시 탐구 계획서(질문) 참고')
    .setRequired(true);
  form.addTextItem()
    .setTitle('그 질문에 대해 왜 그런 결과가 나올 거라고 생각했나? (가설과 그 이유)')
    .setHelpText('💡 2차시 탐구 계획서(가설) 참고')
    .setRequired(true);
  form.addTextItem()
    .setTitle('가설을 확인하기 위해 어떤 실험(탐구)을 계획했나?')
    .setHelpText('💡 2차시 탐구 계획서(탐구과정·변인 등) 참고. 예: "~을 ~해서 ~하는 탐구를 계획했다. 변인은 …, 과정은 …"')
    .setRequired(true);
  form.addTextItem()
    .setTitle('탐구 과정에서 어떤 문제나 어려움이 있었나?')
    .setHelpText('💡 3차시 탐구 보고서를 떠올리며, 그때 경험을 적어보자.')
    .setRequired(true);
  form.addTextItem()
    .setTitle('그 문제를 어떻게 해결했나?')
    .setHelpText('💡 3차시 탐구 보고서를 떠올리며, 그때 경험을 적어보자.')
    .setRequired(true);
  form.addTextItem()
    .setTitle('전시(전람회) 발표 때 무엇을 중심으로 설명했고, 어떤 반응(질문·피드백)을 받았나?')
    .setRequired(true);

  // ── ③ 과학적 소양 및 삶과 연결하기 (2점) ─────────────
  form.addSectionHeaderItem().setTitle('③ 과학적 소양 및 삶과 연결하기 (2점)');
  form.addParagraphTextItem()
    .setTitle('이번 탐구·전시 과정에서 나는 어떤 태도로 참여했는지 스스로 평가해보자.')
    .setHelpText('적극성, 협력, 책임감 등 — 잘한 점과 아쉬운 점')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('이번에 배운 과학 지식이 나의 건강 관리, 미래(진로), 우리 사회 중 하나를 골라 어떻게 도움이 될 수 있을지 적고, 앞으로 실제로 해보고 싶은 실천 한 가지를 적어보자.')
    .setHelpText('감각기관·신경계·호르몬 등')
    .setRequired(true);

  // ── 응답을 받을 스프레드시트를 새로 만들어 연결 ───────
  const ss = SpreadsheetApp.create('자극과 반응 전람회 · 성찰일지 응답 (9차시)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('설문지(응답용) URL: ' + form.getPublishedUrl());
  Logger.log('설문지(편집용) URL: ' + form.getEditUrl());
  Logger.log('응답 스프레드시트: ' + ss.getUrl());
}
