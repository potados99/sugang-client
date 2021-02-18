window.onload = moveToNextPhase;

const baseUrl = 'http://sugang.inu.ac.kr:8885';

const endpoints = {
    login: `${baseUrl}/jsp/loginCheck.jsp`,
    init: `${baseUrl}/jsp/SukangInit.jsp`,
    submit: `${baseUrl}/jsp/SukangResultList.jsp`,
}

const states = {
    currentPhase: -1,
    currentForm: -1
};

const phases = [
    {
        name: 'START',
        onEnterPhase: () => {
            _startClock();
            _checkIfBrowserSupportsPromise();
        },
        onDidEnterPhase: () => {
            // Escape immediately.
            moveToNextPhase();
        }
    },
    {
        name: 'INPUT',
        onEnterPhase: () => {
            // Add initial field.
            _addCourseIdField();
            _activateSingleSection('#inputSection');
        }
    },
    {
        name: 'REQUEST_LOGIN',
        onEnterPhase: () => {
            _activateSingleSection('#performSection');
            _setPerformDescriptionMessage('수강신청이 시작되면 아래 버튼을 눌러주세요.<br>버튼을 누르면 <b>새 창으로 이동</b>합니다. <br><br>새 창에 결과가 표시될 때까지 기다렸다가 <b>로그인이 성공하는 것을 꼭 확인</b>해 주세요. 사용자가 몰리면 로그인이 느릴 수 있으니 <b>꼭 기다려 주셔야 합니다.</b> <br><br>로그인에 성공하셨면 다음 진행을 위해 <b>이 창으로 돌아와</b> 주세요.');
            _setPerformButton('로그인하기', () => {
                _login();
                moveToNextPhase();
            });
        },
        onLeavePhase: () => {
            _setPerformDescriptionMessage('로그인에 성공하셨나요?<br><br>아래 버튼을 누르면 <b>새 창으로</b> 이동해 다음 강의 수강 요청을 보냅니다.<br><br>새 창에서 <b>결과 화면이 뜰 때까지 기다려</b> 주세요. 신청한 강의가 <b>잘 처리되었는지 꼭 확인</b>해 주셔야 합니다.<br><br>(만약 결과 목록에 방금 신청한 강의가 없다면 마감되었거나 보안문자 관련하여 문제가 생긴 것입니다. <a href="https://sugang.inu.ac.kr/sukang_main.html">수강신청 페이지</a>에서 다시 시도해 주세요.)<br><br>결과를 확인하신 다음 <b>이 창으로 돌아와</b> 주세요.');
        }
    },
    {
        name: 'REQUEST_SUBMIT',
        onEnterPhase: () => {
            _startSubmitPhase();
        }
    },
    {
        name: 'END',
        onEnterPhase: () => {
            _setPerformDescriptionMessage('모두 끝났습니다!');
            _setPerformButton('확인하러 가기', () => {
                _openResultPage();
            });
        }
    }
];


/****************************************************************
 * State machine
 ****************************************************************/

function moveToNextPhase() {
    const nextPhase = this._findNextPhase();
    if (nextPhase === undefined) {
        // Already reached the end.
        console.log('No next phase!');
        return;
    }

    if (states.currentPhase === -1) {
        console.log('Starting.');
    } else {
        console.log(`Moving phase from ${phases[states.currentPhase].name} to ${phases[nextPhase].name}.`);
    }

    // On leave
    try {
        phases[states.currentPhase].onLeavePhase();
    } catch (e) {
        // Do nothing.
    }

    // On enter
    try {
        phases[nextPhase].onEnterPhase();
    } catch (e) {
        // Do nothing.
    }

    states.currentPhase = nextPhase;

    // On did enter
    try {
        phases[nextPhase].onDidEnterPhase();
    } catch (e) {
        // Do nothing.
    }
}

function _findNextPhase() {
    const lastPhase = phases.length - 1;
    if (states.currentPhase >= lastPhase) {
        // No next phase.
        return undefined;
    }

    return states.currentPhase + 1;
}


/****************************************************************
 * Submitting course ids
 ****************************************************************/

function _startSubmitPhase() {
    _setPerformButtonForNextSubmit();
}

function _setPerformButtonForNextSubmit() {
    const nextForm = _previewNextFormToSubmit();
    const nextCourseId = nextForm['par_haksuNo'].value;

    _setPerformButton(`다음 강의(${nextCourseId}) 신청하기`, _submitNext);
}

function _submitNext() {
    const formToSubmit = _getNextFormToSubmit();
    if (!formToSubmit) {
        moveToNextPhase();
        return;
    }

    formToSubmit.submit();

    const formToSubmitNextTime = _previewNextFormToSubmit();
    if (!formToSubmitNextTime) {
        moveToNextPhase();
        return;
    }

    _setPerformDescriptionMessage('신청에 성공하셨나요?<br><br>아래 버튼을 누르면 <b>새 창으로</b> 이동해 다음 강의 수강 요청을 보냅니다.<br><br>새 창에서 <b>결과 화면이 뜰 때까지 기다려</b> 주세요. 신청한 강의가 <b>잘 처리되었는지 꼭 확인</b>해 주셔야 합니다.<br><br>(만약 결과 목록에 방금 신청한 강의가 없다면 마감되었거나 보안문자 관련하여 문제가 생긴 것입니다. <a href="https://sugang.inu.ac.kr/sukang_main.html">수강신청 페이지</a>에서 다시 시도해 주세요.)<br><br>결과를 확인하신 다음 <b>이 창으로 돌아와</b> 주세요.');
    _setPerformButtonForNextSubmit();
}

function _previewNextFormToSubmit() {
    const forms = Array.from(document.getElementById('formsContainer').children);
    const nextFormIndex = states.currentForm + 1;

    const nextExists = (nextFormIndex < forms.length);
    if (!nextExists) {
        return undefined;
    }

    return forms[nextFormIndex];
}

function _getNextFormToSubmit() {
    const form = _previewNextFormToSubmit();
    if (form) {
        states.currentForm += 1;
    }

    return form;
}


/****************************************************************
 * Request actions
 ****************************************************************/

function _openResultPage() {
    window.open(endpoints.init);
}

function _login() {
    const form = document.loginForm;

    form.action = endpoints.login;
    form.submit();
}


/****************************************************************
 * DOM manipulation
 ****************************************************************/

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

function _addCourseIdField() {
    _createAndAppendForm();

    // Invoke this for the newly added form.
    _trimAllTextInputs();
}

function _createAndAppendForm() {
    const newForm = document.createElement('form');
    newForm.action = endpoints.submit;
    newForm.target = '_blank';
    newForm.method = 'post';
    newForm.innerHTML = `
            <label>
                <input type="text" name="par_haksuNo" placeholder="학수번호">
            </label>
            <input type="hidden" name="par_type" value="insert"> <!-- part of API -->
    `;

    document.getElementById('formsContainer').appendChild(newForm);
}

function _trimAllTextInputs() {
    const inputs = document.getElementsByTagName('input');
    for (const input of inputs) {
        if (input.type === 'text') {
            input.onchange = function() {
                this.value = this.value.replace(/^\s+/, '').replace(/\s+$/, '');
            };
        }
    }
}

function _activateSingleSection(sectionSelector) {
    // Disable all sections
    const allSections = document.getElementsByClassName('section part-of-phase');
    for (const section of allSections) {
        _disableElement(section);
    }

    // Enabled given section
    const sectionToActivate = document.querySelector(sectionSelector);
    _enableElement(sectionToActivate);
}

function _setPerformButton(buttonLabel, action) {
    const button = document.getElementById('performButton');

    button.innerText = buttonLabel;
    button.onclick = action;
}

function _setPerformDescriptionMessage(message) {
    document.getElementById('performDescription').innerHTML = message;
}


/****************************************************************
 * Utilities
 ****************************************************************/

function _checkIfBrowserSupportsPromise() {
    if(typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1){
        // Promise enabled.
    } else {
        alert('지원하지 않는 브라우저입니다!');
    }
}

function _disableElement(element) {
    element.style.display = 'none';
}

function _enableElement(element) {
    element.style.display = 'block';
}
