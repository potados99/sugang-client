window.onload = function () {
    _startClock();
    _makeAllInputsTrimText()
};

function _startClock() {
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

function _makeAllInputsTrimText() {
    const inputs = document.getElementsByTagName('input');
    for (const input of inputs) {
        if (input.type === 'text') {
            input.onchange = function() {
                this.value = this.value.replace(/^\s+/, '').replace(/\s+$/, '');
            };
        }
    }
}

function login() {
    const form = document.loginForm;

    form.action = endpoints.login;
    form.submit();
}

function addCourseIdFormRow() {
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

    courseIds.forEach(_createAndAppendCourseIdForm);

    if (courseIds.length === 1) {
        // Reset on single input.
        input.value = '';
    }

    // Invoke this for the newly added form.
    _makeAllInputsTrimText();
}

function _createAndAppendCourseIdForm(courseId) {
    const newId = `form_${_generateId()}`;

    document.getElementById('courseIdFormRows').innerHTML += `
            <form id="${newId}" class="row" target="_blank" action="${endpoints.submit}" method="post">
                <input class="col-7 col-input" name="par_haksuNo" value="${courseId}">
                <input type="hidden" name="par_type" value="insert"> 

                <button class="col-1 col-button plain-button" type="button" onclick="_removeElement('${newId}')">X</button>
                <button class="col-2 col-button green-button" type="submit">신청하기</button>
            </form>
    `;
}

function _generateId() {
    return Math.random().toString(36).substring(2);
}


function _removeElement(id) {
    const element = document.getElementById(id);

    element.parentElement.removeChild(element);
}

const baseUrl = 'http://sugang.inu.ac.kr:8885';

const endpoints = {
    login: `${baseUrl}/jsp/loginCheck.jsp`,
    init: `${baseUrl}/jsp/SukangInit.jsp`,
    submit: `${baseUrl}/jsp/SukangResultList.jsp`,
}

function _openResultPage() {
    window.open(endpoints.init);
}

