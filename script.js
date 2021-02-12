window.onload = function() {
    addField();
    trimAllTextInputs();
};

const state = {
    frameIsLoaded: false
};

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

function addField() {
    _createAndAppendForm();
    _updateSubmitAllButton();

    // Invoke this for the newly added form.
    trimAllTextInputs();
}

function _createAndAppendForm() {
    const newForm = document.createElement('form');
    newForm.target = 'delegateFrame';
    newForm.action = 'http://sugang.inu.ac.kr/jsp/SukangResultList.jsp';
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

async function submitAll() {
    const forms = Array.from(document.getElementById('forms').children);
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    for (const form of forms) {

        state.frameIsLoaded = false;

        console.log('Sent request!');
        form.submit();

        while (!state.frameIsLoaded) {
            // Wait until the frame is loaded(=submit is finished).
            console.log('Waiting for response!');
            await sleep(100);
        }

        await sleep(1000);
    }
}

function onFrameLoaded() {
    state.frameIsLoaded = true;
}
