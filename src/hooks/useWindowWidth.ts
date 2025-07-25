import { useState, useEffect } from 'react';

// 브라우저 창의 현재 너비를 반환하는 커스텀 훅
export const useWindowWidth = () => {
  // window.innerWidth로 초기 상태 설정
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // 창 크기가 변경될 때마다 너비를 업데이트하는 핸들러
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // 'resize' 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거 (메모리 누수 방지)
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 이 이펙트는 컴포넌트 마운트 시 한 번만 실행됩니다.

  return windowWidth;
};