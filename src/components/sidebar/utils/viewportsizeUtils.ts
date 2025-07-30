/**
 * 현재 브라우저 뷰포트의 너비와 높이를 픽셀(px) 단위로 구합니다.
 * (스크롤바 포함)
 * @returns {{width: number, height: number}} 뷰포트 크기 객체
 */
export const getViewportSize = (): { width: number; height: number } => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};