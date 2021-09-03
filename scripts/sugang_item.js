/****************************************************************
 * [수강 아이템]
 * 수강 아이템을 다루는 함수들입니다.
 *
 * 수강 아이템은, 학수번호(courseId)와 메모(memo)로 이루어져,
 * 하나의 신청할 과목을 나타내는 엔티티입니다.
 ****************************************************************/

function toSugangItem(courseIdWithMemo) {
  try {
    const [, rawCourseId, , rawMemo] = /([^()]+)(\((.+)\))?/.exec(courseIdWithMemo);

    return {
      courseId: rawCourseId?.trim(),
      memo: rawMemo?.trim()
    }
  } catch (e) {
    alert(`학수번호가 올바르지 않은 형태입니다 :(`);

    return {
      courseId: '???',
      memo: '???'
    };
  }
}
