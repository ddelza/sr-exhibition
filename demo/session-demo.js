// 자극과 반응 전람회 — 로그인 세션 공용 스크립트
//
// index.html에서 학번/이름 확인이 끝나면 setSrStudent()로 로그인 정보를 저장한다.
// 다른 차시 활동 페이지(같은 저장소 안의 다른 html)에서는 이 파일을 그대로 불러와
// requireSrLogin()만 호출하면, index.html에서 이미 확인된 학번/이름을 다시 입력받지
// 않고 그대로 이어받아 쓸 수 있다. localStorage는 같은 GitHub Pages 사이트
// (예: https://ddelza.github.io/sr-exhibition/) 안의 모든 페이지에서 공유되기 때문에
// 가능하다.
//
// 사용법 (활동 페이지 쪽 예시):
//   <script src="session.js"></script>
//   <script>
//     const student = requireSrLogin(); // 로그인 안 되어 있으면 자동으로 index.html로 이동
//     if (student) {
//       // student = { id, name, grade, ban, num, email }
//       document.getElementById('who').textContent = student.name + ' (' + student.id + ')';
//       // 제출할 때도 student.id / student.name을 그대로 사용하면 됨
//     }
//   </script>

(function () {
  var KEY = 'srExhibitionDemoAuth'; // 실제 사이트와 로그인이 섞이지 않도록 별도 키

  window.getSrStudent = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.id || !data.name) return null;
      return data;
    } catch (e) {
      return null;
    }
  };

  window.setSrStudent = function (student) {
    localStorage.setItem(KEY, JSON.stringify(student));
  };

  window.clearSrStudent = function () {
    localStorage.removeItem(KEY);
  };

  // 로그인이 안 되어 있으면 알림 후 index.html로 돌려보낸다.
  // 활동 페이지 맨 위에서 이 함수만 호출하면 됨.
  window.requireSrLogin = function () {
    var student = window.getSrStudent();
    if (!student) {
      alert('먼저 메인 페이지에서 학번과 이름으로 입장해 주세요.');
      var base = location.pathname.replace(/[^/]*$/, '');
      location.href = base + 'index.html';
      return null;
    }
    return student;
  };

  window.srLogout = function () {
    window.clearSrStudent();
    var base = location.pathname.replace(/[^/]*$/, '');
    location.href = base + 'index.html';
  };

  // who-banner 등에 표시할 이름표. 교사 계정(isTeacher)은 학년/반/번호가 없으므로 따로 처리.
  window.srWhoLabel = function (student) {
    if (!student) return '';
    if (student.isTeacher) return student.name + ' 선생님 (교사 계정)';
    if (student.isDemoTeacher) return student.name + ' 선생님 (연수 계정 · 6반 ' + student.num + '번)';
    return student.grade + '학년 ' + student.ban + '반 ' + student.num + '번 ' + student.name;
  };

  // 채점 실습 권한: 연수 계정(3601~3630)과 교사 계정
  window.srIsGrader = function (s) { return !!(s && (s.isDemoTeacher || s.isTeacher)); };

  // 모든 화면 하단에 데모 표시
  document.addEventListener('DOMContentLoaded', function () {
    var d = document.createElement('div');
    d.textContent = '🧪 교사 연수 체험용 데모 사이트 — 학생 이름은 모두 익명화되어 있습니다';
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#2a1e6e;color:#fff;font-size:12px;text-align:center;padding:5px 8px;opacity:.94';
    document.body.appendChild(d);
    document.body.style.paddingBottom = '30px';
  });
})();
