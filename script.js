window.onload = initialize;

const state = {
    frameIsLoaded: false
};


/****************************************************************
 * Public
 ****************************************************************/

function initialize() {
    addField();
    _trimAllTextInputs();
    _browserSupportsPromise();
    _startClock();
}

function addField() {
    _createAndAppendForm();
    _updateSubmitAllButton();

    // Invoke this for the newly added form.
    _trimAllTextInputs();
}

function login() {
    onFrameStartLoading();

    // Post will be handled by <form>.
}

async function submitAll() {
    const forms = Array.from(_getFormsContainer().children);
    const progress = _getRequestProgress();

    const start = Date.now();

    // Blocking loop.
    for (const [i, form] of forms.entries()) {
        progress.style.display = 'block';
        progress.innerText = `${forms.length}개 중 ${i+1}번째(${form.par_haksuNo.value}) 신청 중...`;

        // Wait until submit finishes.
        await _submitForm(form);

        const hasNext = (i < forms.length - 1);
        if (hasNext) {
            await _sleep(1000);
        }
    }

    const end = Date.now();
    const diffSec = (end - start) / 1000;

    progress.innerHTML = `${forms.length}개 요청 전송 완료. ${diffSec}초 소요됨. <a href="https://sugang.inu.ac.kr/jsp/SukangResultList.jsp" target="_blank">결과 보기</a>`;
}

function onFrameStartLoading() {
    state.frameIsLoaded = false;
    _markFrameAsLoading();
}

function onFrameLoaded() {
    state.frameIsLoaded = true;
    _markFrameAsNotLoading();
}


/****************************************************************
 * Private
 ****************************************************************/

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

    _getFormsContainer().appendChild(newForm);
}

function _updateSubmitAllButton() {
    const numberOfForms = _getFormsContainer().childElementCount;
    const submitAllButton = document.getElementById('submitAllButton');
    submitAllButton.innerText = `${numberOfForms}개 강의 신청하기`;
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

async function _submitForm(form) {
    onFrameStartLoading();

    form.submit();

    while (!state.frameIsLoaded) {
        await _sleep(100);
    }
}

function _markFrameAsLoading() {
    _getDelegateFrameLoading().style.visibility = 'visible';
}

function _markFrameAsNotLoading() {
    _getDelegateFrameLoading().style.visibility = 'hidden';
}

function _startClock() {
    _updateClock();
    setInterval(_updateClock, 10);
}

function _updateClock() {
    const clock = _getClock();

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    clock.innerText = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}


/****************************************************************
 * Cached elements accessors
 ****************************************************************/

const elementsCache = {};

function _getClock() {
    if (elementsCache.clock === undefined) {
        elementsCache.clock = document.getElementById('clock');
    }

    return elementsCache.clock;
}

function _getFormsContainer() {
    return _getElement('formsContainer');
}

function _getRequestProgress() {
    return _getElement('requestProgress');
}

function _getDelegateFrameLoading() {
    return _getElement('delegateFrameLoading');
}

function _getElement(id) {
    if (elementsCache[id] === undefined) {
        elementsCache[id] = document.getElementById(id);
    }

    return elementsCache[id];
}


/****************************************************************
 * Utilities
 ****************************************************************/

async function _sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function _browserSupportsPromise() {
    if(typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1){
        // Promise enabled.
    } else {
        alert('지원하지 않는 브라우저입니다!');
    }
}
