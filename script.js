window.onload = function() {
    addField();
};

function addField() {
    _createAndAppendForm();
    _updateSubmitAllButton();
}

function _createAndAppendForm() {
    const newForm = document.createElement('form');
    newForm.target = 'hiddenFrame';
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
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    for (const form of forms) {
        form.submit();
        await timer(1000);
    }
}
