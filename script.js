/** Configurations */

const baseUrl = 'http://sugang.inu.ac.kr:8885';

const endpoints = {
    login: `${baseUrl}/jsp/loginCheck.jsp`,
    init: `${baseUrl}/jsp/SukangInit.jsp`,
    submit: `${baseUrl}/jsp/SukangResultList.jsp`,
}


/** Initial things */

window.onload = function () {
    _startClock();
    _restoreMemo();
    _restoreLoginForm();
    _prepareLoginForm();
    _restoreCourseIdsInput();
};

function _startClock() {
    console.log('Starting clock. Update every 10ms.');

    _updateClock();
    setInterval(_updateClock, 10);
}

function _updateClock() {
    const clock = document.getElementById('clock');

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    clock.innerText = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

function _restoreMemo() {
    console.log('Restoring memo.');

    document.getElementById('memoPad').value = localStorage.getItem("memoText");
}

function _restoreLoginForm() {
    console.log('Restoring login form.');

    document.loginForm.stuno.value = localStorage.getItem('stuno');
    // Not restore password.
}

function _prepareLoginForm() {
    console.log('Setting action for login form.');

    // Set action dynamically.
    document.loginForm.action = endpoints.login;
}

function _restoreCourseIdsInput() {
    console.log('Restoring course ids input.');

    document.getElementById('courseIdsInput').value = localStorage.getItem('courseIds');
}

/** Called by HTML */

function saveMemo() {
    localStorage.setItem("memoText", document.getElementById('memoPad').value);
}

function saveLoginForm() {
    localStorage.setItem("stuno", document.loginForm.stuno.value);
    // Not save password.
}

function saveCourseIdsInput() {
    localStorage.setItem("courseIds", document.getElementById('courseIdsInput').value);
}

function addCourseIdFormRows() {
    const input = document.getElementById('courseIdsInput');
    const commaSeparatedCourseIdsFromUserInput = input.value;
    const trimmed = commaSeparatedCourseIdsFromUserInput.trim();
    if (!trimmed) {
        alert('학수번호를 입력해 주세요!');
        return;
    }

    const courseIds = trimmed
        .split(',')
        .map((each) => each.trim())
        .filter((trimmed) => trimmed);

    courseIds.forEach(_createAndAppendCourseIdFormRow);

    if (courseIds.length === 1) {
        // Reset on single input.
        _clearCourseIdsInput();
    }
}

function _createAndAppendCourseIdFormRow(courseIdWithMemo) {
    const newId = `form_${_generateId()}`;
    const {courseId, memo} = _separateCourseIdAndMemo(courseIdWithMemo);

    console.log(`Adding course id form row: (courseId: ${courseId}, memo: ${memo})`);

    const newRowsHTML = `
            <div style="font-size: 12px; margin-left: 1px; margin-bottom: -7px;">
                ${memo || '⠀'} <!-- Take up its place even without memo. -->
            </div>
            <form class="row" target="_blank" action="${endpoints.submit}" method="post">
                <input class="col-7 col-input" name="par_haksuNo" value="입력을 확인해 주세요!">
                <input type="hidden" name="par_type" value="insert"> 

                <button class="col-1 col-button plain-button" type="button" onclick="_removeElement('${newId}')" style="min-width: 35px;">X</button>
                <button class="col-2 col-button green-button" type="submit" style="min-width: 75px;">신청하기</button>
            </form>
    `;

    // Wrap into div.
    const newRowsWrapper = document.createElement('div');
    newRowsWrapper.id = newId;
    newRowsWrapper.innerHTML = newRowsHTML;

    // Set par_haksuNo value programmatically to prevent unexpected escape.
    const courseIdInput = newRowsWrapper.getElementsByTagName('form')[0].elements['par_haksuNo'];
    courseIdInput.value = courseId;

    document.getElementById('courseIdFormRows').appendChild(newRowsWrapper);
}

function _generateId() {
    return Math.random().toString(36).substring(2);
}

function _separateCourseIdAndMemo(courseIdWithMemo) {
    try {
        const [, rawCourseId, , rawMemo] = /([^()]+)(\((.+)\))?/.exec(courseIdWithMemo);

        return {
            courseId: rawCourseId?.trim(),
            memo: rawMemo?.trim()
        }
    } catch (e) {
        console.error(`Failed to parse course id! ${e}`);

        return courseIdWithMemo;
    }
}

function _clearCourseIdsInput() {
    const input = document.getElementById('courseIdsInput');

    input.value = '';
    localStorage.removeItem("courseIds");
}

function _removeElement(id) {
    const element = document.getElementById(id);

    element.parentElement.removeChild(element);
}

function openResultPage() {
    window.open(endpoints.init);
}
