import { useEffect, useState, useRef } from 'react';

export function useAnimatedValue(target: number, duration: number = 1500) {
  const [current, setCurrent] = useState(target);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (current === target) return;

    setIsAnimating(true);
    const startValue = current;
    const startTime = Date.now();
    const difference = target - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutCubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const nextValue = startValue + difference * eased;
      setCurrent(nextValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration]);

  return { value: current, isAnimating };
}
