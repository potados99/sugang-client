/****************************************************************
 * [초기화]
 * 페이지가 로드되는 시점에 수행해야 하는 일들에 대한 정의(window.onload)와,
 * 그 일을 하는 데에 필요한 함수들입니다.
 ****************************************************************/

window.onload = function () {
  /**
   * 로드 시점에 이런 일들을 할 겁니다.
   */
  startClock();
  restoreMemo();
  restoreLoginForm();
  prepareLoginForm();
  restoreCourseIdsInput();
  prepareCourseIdsInput();
};

function startClock() {
  console.log('시계를 시작합니다. 매 10밀리초마다 업데이트합니다.');

  updateClock();
  setInterval(updateClock, 10);
}

function updateClock() {
  const clock = document.getElementById('clock');

  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // 이 부분 날짜 라이브러리 쓰기 싫어서 수동으로 처리했어요 흑 ㅠㅜ
  const h = hours < 10 ? `0${hours}` : hours;
  const m = minutes < 10 ? `0${minutes}` : minutes;
  const s = seconds < 10 ? `0${seconds}` : seconds;

  clock.innerText = `${h}:${m}:${s}`;
}

function restoreMemo() {
  console.log('메모를 복구합니다.');

  document.getElementById('memoPad').value = localStorage.getItem("memoText");
}

function restoreLoginForm() {
  console.log('로그인 폼을 복구합니다.');

  /**
   * 브라우저를 껐다 켜거나, 새로고침을 했거나, 또는 다른 페이지를 갔다 왔을 때에,
   * 로그인 폼에 입력한 학번을 로컬 저장소에서 불러와 복구합니다.
   * 비밀번호는 저장도 복구도 안 합니다.
   */
  document.loginForm.stuno.value = localStorage.getItem('stuno');
}

function prepareLoginForm() {
  console.log('로그인 폼을 준비합니다.');

  /**
   * 로그인 폼의 액션(어디로 보낼지)은 맨 위 endpoints에 따라 달라질 수 있기 때문에
   * HTML에다가 쓰지 않구 초기화 시점에 동적으로 설정해 주었습니다.
   */
  document.loginForm.action = endpoints.login;
}

function restoreCourseIdsInput() {
  console.log('학수번호 입력 폼을 복구합니다.');

  /**
   * 학수번호 입력 폼이 유실되는 상황에서도 로컬 저장소에 남아있는 정보를 가져와 복구합니다.
   */
  document.getElementById('courseIdsInput').value = localStorage.getItem('courseIds');
}

function prepareCourseIdsInput() {
  console.log('학수번호 입력 폼을 준비합니다.');

  /**
   * 엔터가 눌렸을 때에 적절한 일이 일어날 수 있게
   * 이벤트 리스너를 설정합니다.
   */
  document.getElementById('courseIdsInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      addSugangFormsFromInput();
    }
  })
}
