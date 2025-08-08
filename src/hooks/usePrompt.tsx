import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function usePrompt(when: boolean, message: string) {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const originalPush = navigator.push;

    navigator.push = (...args: Parameters<typeof originalPush>) => {
      if (window.confirm(message)) {
        console.log(args)
        originalPush(...args);
      }
    };

    return () => {
      navigator.push = originalPush;
    };
  }, [navigator, when, message]);
}
