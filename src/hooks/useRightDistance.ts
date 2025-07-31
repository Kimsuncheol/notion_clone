import { useEffect, useState, useRef } from 'react';

function useRightDistance<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [distance, setDistance] = useState<number>(0);

  const updateDistance = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setDistance(window.innerWidth - rect.right);
  };

  useEffect(() => {
    updateDistance();
    window.addEventListener('resize', updateDistance);
    return () => window.removeEventListener('resize', updateDistance);
  }, []);

  return [ref, distance];
}

export default useRightDistance;