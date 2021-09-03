/****************************************************************
 * [외부에 노출됨]
 * HTML에서 사용하는 함수들입니다.
 ****************************************************************/

function saveMemo() {
  localStorage.setItem(
    'memoText',
    document.getElementById('memoPad').value
  );
}

function saveLoginForm() {
  localStorage.setItem(
    'stuno',
    document.loginForm.stuno.value
  );
}

function saveCourseIdsInput() {
  localStorage.setItem(
    'courseIds',
    document.getElementById('courseIdsInput').value
  );
}

function addSugangFormsFromInput() {
  const rawInputs = document
    .getElementById('courseIdsInput')
    .value
    .trim();

  if (!rawInputs) {
    alert('학수번호를 입력해 주세요 :)');
    return;
  }

  const courseIdFormItems = rawInputs
    .split(',')
    .map(each => each.trim())
    .filter(trimmed => trimmed)
    .map(toSugangItem);

  const total = courseIdFormItems.length;

  let added = 0;
  let ignored = 0;

  for (const {courseId, memo} of courseIdFormItems) {
    if (findExistingSugangForm(courseId)) {
      console.log(`학수번호 ${courseId}인 과목은 이미 추가되어 있어서 건너뜁니다.`);
      ignored++;
      continue;
    }

    addSugangForm(courseId, memo);
    added++;
  }

  _tellUserAboutTheResult({total, added, ignored});
}

function _tellUserAboutTheResult({total, added, ignored}) {
  const allAdded = added > 0 && added === total;
  const allIgnored = ignored > 0 && ignored === total;

  if (allAdded) {
    notifyResult(`${added}과목을 추가했습니다.`);
  } else if (allIgnored) {
    notifyResult(`${ignored}과목 모두 이미 추가되어 있어 건너뛰었습니다.`);
  } else {
    notifyResult(`${added}과목을 추가했습니다. 중복된 ${ignored}과목은 건너뛰었습니다.`)
  }
}

function openResultPage() {
  window.open(endpoints.init);
}
