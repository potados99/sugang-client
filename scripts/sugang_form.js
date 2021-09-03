/****************************************************************
 * [수강 폼]
 * 수강 아이템을 나타내는 폼을 찾고 생성하고 삭제하는 함수들입니다.
 ****************************************************************/

function idOfSugangForm(courseId) {
  return `sugang_form_of_${courseId}`;
}

function findExistingSugangForm(courseId) {
  return document.getElementById(idOfSugangForm(courseId));
}

function addSugangForm(courseId, memo) {
  if (findExistingSugangForm(courseId)) {
    console.error('이미 해당 학수번호를 가진 수강 폼이 존재합니다!');
    return;
  }

  console.log(`수강 폼을 하나 생성합니다: (학수번호: ${courseId}, 메모: ${memo})`);

  /**
   * 새로 만들 수강 폼을 식별할 수 있는 id가 필요합니다.
   * 이 id는 나중에 이 폼을 삭제할 때에 폼을 지정하기 위해 사용합니다.
   */
  const newFormId = idOfSugangForm(courseId);

  /**
   * 새로 추가될 수강 폼은 아래 내용으로 이루어집니다.
   */
  const newRowHTML = `
            <!-- 메모 -->
            <div style="font-size: 12px; margin-left: 1px; margin-bottom: -7px;">
                ${memo || '⠀'} <!-- 메모가 없어도 자리는 차지하고 있어야 해요! -->
            </div>
            
            <!-- 학수번호 폼 -->
            <form class="row" target="_blank" action="${endpoints.submit}" method="post">
                <!-- 학수번호 필드 -->
                <input class="col-7 col-input" name="par_haksuNo" value="입력을 확인해 주세요!">
                <input type="hidden" name="par_type" value="insert"> 

                <!-- 삭제 버튼 -->
                <button 
                    class="col-1 col-button plain-button" 
                    type="button" 
                    onclick="removeSugangForm('${courseId}')" 
                    style="min-width: 35px;">
                    X
                </button>
                
                <!-- 신청 버튼 -->
                <button 
                    class="col-2 col-button green-button" 
                    type="submit" 
                    onclick="this.classList.replace('green-button', 'green-consumed-button')" 
                    style="min-width: 75px;">
                    신청(새 창)
                </button>
            </form>
  `;

  /**
   * 요걸 div로 한번 감쌉니다.
   */
  const newRowWrapper = document.createElement('div');
  newRowWrapper.id = newFormId;
  newRowWrapper.innerHTML = newRowHTML;
  newRowWrapper.classList.add('opacity-transition');

  /**
   * 학수번호 값을 집어넣어 줍니다.
   * 위의 HTML에서 par_haksuNo input의 value에다가 ${courseId} 이런식으로 넣어줄 수도 있지만,
   * 그렇게 하면 원치 않는 escape가 생길 수 있기 때문에 이렇게 프로그래밍적으로 합니다.
   */
  newRowWrapper
    .getElementsByTagName('form')
    .item(0)
    .elements['par_haksuNo']
    .value = courseId

  /**
   * 만든 수강 폼을 DOM에 추가해줍니다.
   */
  document.getElementById('courseIdFormRows').appendChild(newRowWrapper);

  /**
   * 수강 폼을 fade-in 합니다.
   * DOM 추가 직후에 opacity를 설정하면 transition이 작동하지 않기 때문에
   * setTimeout을 사용합니다.
   */
  setTimeout(() => {
    newRowWrapper.style.opacity = '1';
  }, 0);
}

function removeSugangForm(courseId) {
  const element = findExistingSugangForm(courseId);

  element.parentElement.removeChild(element);
}

function notifyResult(message) {
  const formResult = document.getElementById('addFormResult')

  formResult.innerText = message;
  formResult.style.lineHeight = '1.7';

  setTimeout(() => {
    formResult.style.lineHeight = '0';
  }, 2000);
}
