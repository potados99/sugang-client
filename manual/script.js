window.onload = moveToNextPhase;

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
            _setPerformDescriptionMessage('아래 버튼을 누르면 <b>새 창으로 이동</b>합니다. 새 창에 결과가 표시될 때까지 기다렸다가 <b>이 창으로 돌아와</b> 주세요.');
            _setPerformButton('로그인하기', () => {
                _login();
                moveToNextPhase();
            });
        },
        onLeavePhase: () => {
            _setPerformDescriptionMessage('로그인에 성공하셨나요? 아래 버튼을 눌러 계속해 주세요.');
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

    _setPerformButton(`다음 강의(${nextCourseId}) 수강하기`, _submitNext);
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

    _setPerformDescriptionMessage('<b>해당 강의의 신청 결과를 확인</b>하셨나요? 아래 버튼을 눌러 다음 강의에 대한 수강 요청을 보내세요. <b>새 탭에서</b> 열립니다.');
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
    window.open('http://sugang.inu.ac.kr:8885/sukang_main.html');
}

function _login() {
    document.loginForm.submit();
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
    newForm.target = '_blank';
    newForm.action = 'https://sugang.inu.ac.kr/jsp/SukangResultList.jsp';
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
