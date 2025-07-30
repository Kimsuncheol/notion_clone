/**
 * 뷰포트 최상단에서 특정 요소까지의 수직 거리를 픽셀(px) 단위로 구합니다.
 * @param element 거리를 측정할 HTMLElement
 * @returns {number} 뷰포트 상단으로부터의 거리. 요소가 없으면 0을 반환합니다.
 */

export const getOffset = (element: HTMLElement | null): { x: number, y: number } => {
  if (!element) {
    console.log('element: ', element);
    console.log('getOffset: element is null');
    return { x: 0, y: 0 };
  }

  const rect = element.getBoundingClientRect();
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;

  return {
    x: rect.left + scrollX,
    y: rect.top + scrollY
  };
};

export const getPositionById = (id: string): { x: number, y: number } => {
  const element = document.getElementById(id);
  return getOffset(element);
};
