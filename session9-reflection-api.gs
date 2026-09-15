/**
 * 9차시 실전 성찰일지(구글 설문지) 응답 스프레드시트를 읽어 JSON으로 돌려주는
 * Apps Script 웹앱. teacher9.html(GitHub Pages)이 이 웹앱의 /exec URL을
 * fetch로 호출해서 응답 현황을 보여준다.
 *
 * 설치 방법
 * 1) 응답 스프레드시트를 연다:
 *    https://docs.google.com/spreadsheets/d/18DOrYRec5UQp4xGs4Jv4yS_AXiSE9CB_aEgEbm53wRs/edit
 * 2) 확장 프로그램 > Apps Script 로 들어가서, 기본 Code.gs 내용을 전부 지우고
 *    이 파일 내용을 붙여넣는다.
 * 3) 저장(Ctrl+S) 후, 배포 > 새 배포 > 유형: 웹 앱
 *    - 액세스 권한이 있는 사용자: **모든 사용자** (반드시 이걸로 바꿔야 GitHub
 *      Pages에서 fetch로 호출할 수 있다)
 *    - 배포 클릭 → 시트 접근 권한 승인
 * 4) 나온 웹 앱 URL(.../exec)을 나(Claude)에게 알려주면, teacher9.html에
 *    그 URL을 넣어서 배포한다.
 */

const SS_ID = '18DOrYRec5UQp4xGs4Jv4yS_AXiSE9CB_aEgEbm53wRs';

// 응답 시트의 열 순서(설문지 문항 순서와 동일, create-session9-form.gs 참고).
// 0:타임스탬프 1:이메일 2:학번 3:이름 4~13: q1a,q1b,q2a~q2f,q3a,q3b
const COLS = ['timestamp', 'email', 'sid', 'name', 'q1a', 'q1b', 'q2a', 'q2b', 'q2c', 'q2d', 'q2e', 'q2f', 'q3a', 'q3b'];

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  let data;
  try {
    if (action === 'getReflections') data = getReflections_();
    else if (action === 'debug') data = debugInfo_();
    else data = { error: 'unknown action' };
  } catch (err) {
    data = { error: err.toString() };
  }
  const callback = e && e.parameter && e.parameter.callback;
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SS_ID);
  return ss.getSheets()[0];
}

function norm_(v) {
  return String(v == null ? '' : v).trim();
}

function getReflections_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1); // 첫 행은 헤더
  const list = [];
  rows.forEach(function (row) {
    const sidRaw = norm_(row[2]);
    if (!sidRaw) return;
    const sid = sidRaw.replace(/\D/g, '');
    if (sid.length !== 4) return; // 학번 형식이 아니면 건너뜀
    const entry = { sid: sid, name: norm_(row[3]), timestamp: row[0] instanceof Date ? row[0].getTime() : null, email: norm_(row[1]) };
    for (let i = 4; i < COLS.length; i++) {
      entry[COLS[i]] = norm_(row[i]);
    }
    list.push(entry);
  });
  // 같은 학번이 여러 번 제출했으면(재제출 등) 가장 마지막(최신) 행을 채택
  const bySid = {};
  list.forEach(function (r) { bySid[r.sid] = r; });
  return { rows: Object.values(bySid) };
}

function debugInfo_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  return { sheetName: sheet.getName(), rowCount: values.length, header: values[0] || [] };
}
