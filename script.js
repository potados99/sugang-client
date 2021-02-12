window.onload = function() {
    addField();
    trimAllTextInputs();
    checkIfBrowserIsCompatible();
};

const state = {
    frameIsLoaded: false
};

function addField() {
    _createAndAppendForm();
    _updateSubmitAllButton();

    // Invoke this for the newly added form.
    trimAllTextInputs();
}

function _createAndAppendForm() {
    const newForm = document.createElement('form');
    newForm.target = 'delegateFrame';
    newForm.action = 'https://sugang.inu.ac.kr/jsp/SukangResultList.jsp';
    newForm.method = 'post';
    newForm.innerHTML = `
            <label>
                <input type="text" name="par_haksuNo" placeholder="학수번호">
            </label>
            <input type="hidden" name="par_type" value="insert"> <!-- part of API -->
    `;

    const formsContainer = document.getElementById('forms');
    formsContainer.appendChild(newForm);
}

function _updateSubmitAllButton() {
    const formsContainer = document.getElementById('forms');
    const numberOfForms = formsContainer.childElementCount;
    const submitAllButton = document.getElementById('submitAllButton');
    submitAllButton.innerText = `${numberOfForms}개 강의 신청하기`;
}

function trimAllTextInputs() {
    const inputs = document.getElementsByTagName('input');
    for (const input of inputs) {
        if (input.type === 'text') {
            input.onchange = function() {
                this.value = this.value.replace(/^\s+/, '').replace(/\s+$/, '');
            };
        }
    }
}

function checkIfBrowserIsCompatible() {
    if(typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1){
        // Promise enabled.
    } else {
        alert('지원하지 않는 브라우저입니다!');
    }
}

function login() {
    onFrameStartLoading();
}

async function submitAll() {
    const forms = Array.from(document.getElementById('forms').children);
    const progress = document.getElementById('progress');

    const start = Date.now();

    // Blocking loop.
    for (const [i, form] of forms.entries()) {
        progress.style.display = 'block';
        progress.innerText = `${forms.length}개 중 ${i+1}번째(${form.par_haksuNo.value}) 신청 중...`;

        // Wait until submit finishes.
        await _submitForm(form);

        const hasNext = (i < forms.length - 1);
        if (hasNext) {
            await sleep(1000);
        }
    }

    const end = Date.now();
    const diffSec = (end - start) / 1000;

    progress.innerHTML = `${forms.length}개 요청 전송 완료. ${diffSec}초 소요됨. <a href="https://sugang.inu.ac.kr/jsp/SukangResultList.jsp" target="_blank">결과 보기</a>`;
}

async function _submitForm(form) {
    onFrameStartLoading();

    form.submit();

    while (!state.frameIsLoaded) {
        await sleep(100);
    }
}

function onFrameStartLoading() {
    state.frameIsLoaded = false;
    _markFrameAsLoading();
}

function onFrameLoaded() {
    state.frameIsLoaded = true;
    _markFrameAsNotLoading();
}

function _markFrameAsLoading() {
    document.getElementById('delegateFrameLoading').style.visibility = 'visible';
}

function _markFrameAsNotLoading() {
    document.getElementById('delegateFrameLoading').style.visibility = 'hidden';
}

async function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
